// src/services/gameService.js
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  getDoc,
  deleteDoc,
  orderBy, // <-- Added for sorting
  writeBatch // <-- Added for recursive delete
} from 'firebase/firestore';
import { calculateAndUpdateScores } from './scoringService';

/**
 * Creates a new game session in Firestore.
 * @param {string} adminId - The UID of the admin creating the game.
 * @param {string} questionBankId - The ID of the question bank to use.
 * @param {string} gameName - The custom name for the game.
 */
export const createNewGame = async (adminId, questionBankId, gameName) => {
  try {
    // New top-level collection
    const gameSessionRef = doc(collection(db, 'gameSessions'));
    const gameSessionId = gameSessionRef.id;

    // Create two PIN versions
    const gamePin = gameSessionId.substring(0, 5); // e.g., "sxq9O" (for display)
    const gamePinUpper = gamePin.toUpperCase(); // e.g., "SXQ9O" (for lookup)

    await setDoc(gameSessionRef, {
      adminId: adminId,
      questionBankId: questionBankId,
      gameName: gameName || 'Untitled Game', // <-- Field added
      gamePin: gamePin, 
      gamePinUpper: gamePinUpper, 
      state: 'waiting',
      currentQuestionIndex: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return gameSessionId;
  } catch (error) {
    console.error("Error creating game:", error);
    throw new Error('Failed to create new game.');
  }
};

/**
 * Fetches all games created by a specific admin, sorted newest first.
 * @param {string} adminId - The UID of the admin.
 */
export const getGamesForAdmin = (adminId) => {
  const gamesRef = collection(db, 'gameSessions');
  const q = query(
    gamesRef, 
    where("adminId", "==", adminId),
    orderBy("createdAt", "desc") // <-- Added for sorting
  );
  return getDocs(q);
};

/**
 * Updates the game state to show the next question with timer from CSV.
 * @param {string} gameId - The game session ID
 * @param {number} currentQuestionIndex - Current question index
 * @param {string} currentState - Current game state
 * @param {Array} questions - Array of questions to get duration
 */
export const showQuestion = async (gameId, currentQuestionIndex, currentState, questions) => {
  if (!gameId) throw new Error('No game ID provided.');
  
  try {
    const gameRef = doc(db, 'gameSessions', gameId);
    
    // Determine new question index
    let newIndex = currentQuestionIndex;
    if (currentState === 'waiting' || currentState === 'answerrevealed' || currentState === 'leaderboard') {
      newIndex = currentState === 'waiting' ? 0 : currentQuestionIndex + 1;
    }

    // Get duration from the question (default to 30 if not found)
    const questionDuration = questions?.[newIndex]?.duration || 30;

    const updates = {
      state: 'questionactive',
      questionStartTime: serverTimestamp(),
      questionDuration: questionDuration, // Use duration from CSV
      updatedAt: serverTimestamp()
    };

    // Only update currentQuestionIndex if it's changing
    if (newIndex !== currentQuestionIndex) {
      updates.currentQuestionIndex = newIndex;
    }

    await updateDoc(gameRef, updates);
    console.log(`Question ${newIndex} shown with ${questionDuration}s timer`);
    return newIndex;
  } catch (error) {
    console.error("Error showing question:", error);
    throw new Error('Failed to show question.');
  }
};

/**
 * Calculates scores and reveals the answer.
 * @param {string} gameId - The game session ID
 * @param {number} currentQuestionIndex - Current question index
 */
export const revealAnswer = async (gameId, currentQuestionIndex) => {
  if (!gameId) throw new Error('No game ID provided.');
  
  try {
    // Get game session to retrieve timer data
    const gameRef = doc(db, 'gameSessions', gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      throw new Error('Game session not found');
    }
    
    const gameData = gameSnap.data();
    
    // Calculate scores with time cutoff
    const scoredPlayers = await calculateAndUpdateScores(
      gameId,
      currentQuestionIndex,
      gameData.questionStartTime,
      gameData.questionDuration || 30
    );

    // Update game state
    await updateDoc(gameRef, {
      state: 'answerrevealed',
      updatedAt: serverTimestamp()
    });

    console.log(`Revealed answer, scored ${scoredPlayers} players`);
    return scoredPlayers;
  } catch (error) {
    console.error("Error revealing answer:", error);
    throw new Error('Error revealing answer.');
  }
};

/**
 * Updates the game state to show the leaderboard.
 * @param {string} gameId - The game session ID
 */
export const showLeaderboard = async (gameId) => {
  if (!gameId) throw new Error('No game ID provided.');
  
  try {
    const gameRef = doc(db, 'gameSessions', gameId);
    await updateDoc(gameRef, {
      state: 'leaderboard',
      updatedAt: serverTimestamp()
    });
    console.log('Leaderboard shown');
  } catch (error) {
    console.error("Error showing leaderboard:", error);
    throw new Error('Error showing leaderboard.');
  }
};

/**
 * Ends the game and sets state to finished
 * @param {string} gameId - The game session ID
 */
export const endGame = async (gameId) => {
  if (!gameId) throw new Error('No game ID provided.');
  
  try {
    const gameRef = doc(db, 'gameSessions', gameId);
    await updateDoc(gameRef, {
      state: 'finished',
      updatedAt: serverTimestamp()
    });
    console.log('Game ended successfully');
  } catch (error) {
    console.error('Error ending game:', error);
    throw new Error('Failed to end game.');
  }
};

/**
 * Deletes a game session AND all its sub-collections (e.g., players).
 * @param {string} gameId - The game session ID to delete.
 */
export const deleteGame = async (gameId) => {
  if (!gameId) throw new Error('No game ID provided.');
  
  const gameRef = doc(db, 'gameSessions', gameId);
  // Define the path to the sub-collection
  const playersRef = collection(db, 'gameSessions', gameId, 'players');

  try {
    // 1. Delete all documents in the 'players' sub-collection
    const playersSnapshot = await getDocs(playersRef);
    const batch = writeBatch(db);
    
    playersSnapshot.forEach((doc) => {
      // Add each player's deletion to the batch
      batch.delete(doc.ref);
    });
    
    // Commit the batch delete for all players
    await batch.commit(); 
    
    // 2. After sub-collection is deleted, delete the main game document
    await deleteDoc(gameRef);
    
    console.log(`Game ${gameId} and all players deleted successfully.`);

  } catch (error) {
    console.error('Error deleting game and its sub-collections:', error);
    // Rethrow the error so the dashboard can catch it and show a message
    throw new Error('Failed to delete game.');
  }
};

/**
 * Sends a broadcast message to all players in the game.
 * @param {string} gameId - The game session ID.
 * @param {string} message - The message content.
 */
export const sendBroadcast = async (gameId, message) => {
  if (!gameId || !message) throw new Error('Game ID and message are required.');

  try {
    const gameRef = doc(db, 'gameSessions', gameId);
    await updateDoc(gameRef, {
      broadcastMessage: {
        message: message,
        sentAt: serverTimestamp() // Use a timestamp to identify new messages
      }
    });
    console.log(`Broadcast message sent to game ${gameId}`);
  } catch (error) {
    console.error("Error sending broadcast message:", error);
    throw new Error('Failed to send broadcast message.');
  }
};