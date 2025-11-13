// src/services/gameService.js
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp, query, where, getDocs, getDoc } from 'firebase/firestore';
import { calculateAndUpdateScores } from './scoringService';

/**
 * Creates a new game session in Firestore.
 * @param {string} adminId - The UID of the admin creating the game.
 * @param {string} questionBankId - The ID of the question bank to use.
 */
export const createNewGame = async (adminId, questionBankId) => {
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
      gamePin: gamePin, // Store the mixed-case PIN for display
      gamePinUpper: gamePinUpper, // Store the all-caps PIN for lookup
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
 * Fetches all games created by a specific admin.
 * @param {string} adminId - The UID of the admin.
 */
export const getGamesForAdmin = (adminId) => {
  const gamesRef = collection(db, 'gameSessions');
  const q = query(gamesRef, where("adminId", "==", adminId));
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