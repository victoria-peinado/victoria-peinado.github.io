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
 * @param {string|object} themeOrData - The selected theme name (e.g., 'flare') or a custom theme object.
 */
export const createNewGame = async (adminId, questionBankId, gameName, themeOrData) => { 
  try {
    const gameSessionRef = doc(collection(db, 'gameSessions'));
    const gameSessionId = gameSessionRef.id;
    const gamePin = gameSessionId.substring(0, 5);
    const gamePinUpper = gamePin.toUpperCase();

    // --- NEW: TTL (Auto-Delete) Logic ---
    // Create a date object for 48 hours from now.
    // Firestore will use this to automatically delete the game session.
    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours() + 48); 
    // ------------------------------------

    let gameData = {
      adminId: adminId,
      questionBankId: questionBankId,
      gameName: gameName || 'Untitled Game',
      gamePin: gamePin, 
      gamePinUpper: gamePinUpper, 
      state: 'waiting',
      currentQuestionIndex: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Add the expiration timestamp to the document
      expireAt: expireAt 
    };

    if (typeof themeOrData === 'object' && themeOrData !== null) {
      // It's a custom theme object
      gameData.theme = 'custom';
      gameData.customThemeData = themeOrData;
    } else {
      // It's a theme name string (e.g., "flare", "default")
      gameData.theme = themeOrData || 'default';
    }

    await setDoc(gameSessionRef, gameData);

    return gameSessionId;
  } catch (error) {
    console.error("Error creating game:", error);
    throw new Error('Failed to create new game.');
  }
};

/**
 * Fetches all games created by a specific admin, sorted newest first.
 */
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
 */
export const deleteGame = async (gameId) => {
  if (!gameId) throw new Error('No game ID provided.');
  
  const gameRef = doc(db, 'gameSessions', gameId);
  const playersRef = collection(db, 'gameSessions', gameId, 'players');

  try {
    const playersSnapshot = await getDocs(playersRef);
    const batch = writeBatch(db);
    
    playersSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit(); 
    await deleteDoc(gameRef);
    
    console.log(`Game ${gameId} and all players deleted successfully.`);

  } catch (error) {
    console.error('Error deleting game and its sub-collections:', error);
    throw new Error('Failed to delete game.');
  }
};