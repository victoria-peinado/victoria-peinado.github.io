// src/services/game/gameManagement.js
import { db } from '../../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  orderBy,
  writeBatch
} from 'firebase/firestore';

/**
 * Creates a new game session in Firestore.
 * @param {string} adminId - The UID of the admin creating the game.
 * @param {string} questionBankId - The ID of the question bank to use.
 * @param {string} gameName - The custom name for the game.
 * @param {string} theme - The selected theme name (e.g., 'default', 'flare')
 */
// --- MAKE SURE 'export' IS HERE ---
export const createNewGame = async (adminId, questionBankId, gameName, theme) => { 
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
      gameName: gameName || 'Untitled Game',
      gamePin: gamePin, 
      gamePinUpper: gamePinUpper, 
      state: 'waiting',
      currentQuestionIndex: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      theme: theme || 'default' // Add the theme to the game document
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
// --- MAKE SURE 'export' IS HERE ---
export const getGamesForAdmin = (adminId) => {
  const gamesRef = collection(db, 'gameSessions');
  const q = query(
    gamesRef, 
    where("adminId", "==", adminId),
    orderBy("createdAt", "desc")
  );
  return getDocs(q);
};

/**
 * Deletes a game session AND all its sub-collections (e.g., players).
 * @param {string} gameId - The game session ID to delete.
 */
// --- MAKE SURE 'export' IS HERE ---
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