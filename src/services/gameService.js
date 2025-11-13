// src/services/gameService.js
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
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
    
    // UPDATED: Create two PIN versions
    const gamePin = gameSessionId.substring(0, 5); // e.g., "sxq9O" (for display)
    const gamePinUpper = gamePin.toUpperCase(); // e.g., "SXQ9O" (for lookup)

    await setDoc(gameSessionRef, {
      adminId: adminId,
      questionBankId: questionBankId,
      gamePin: gamePin, // <-- Store the mixed-case PIN for display
      gamePinUpper: gamePinUpper, // <-- Store the all-caps PIN for lookup
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
 * Updates the game state to show the next question.
 */
export const showQuestion = async (gameId, currentQuestionIndex, currentState) => {
  if (!gameId) throw new Error('No game ID provided.');

  try {
    const gameRef = doc(db, 'gameSessions', gameId);
    const updates = {
      state: 'questionactive',
      updatedAt: serverTimestamp()
    };

    if (currentState === 'answerrevealed' || currentState === 'leaderboard') {
      updates.currentQuestionIndex = currentQuestionIndex + 1;
    }

    await updateDoc(gameRef, updates);
    return updates.currentQuestionIndex || currentQuestionIndex;
  } catch (error) {
    console.error("Error showing question:", error);
    throw new Error('Failed to show question.');
  }
};

/**
 * Calculates scores and reveals the answer.
 */
export const revealAnswer = async (gameId, currentQuestionIndex) => {
  if (!gameId) throw new Error('No game ID provided.');

  try {
    // Pass the new path to the scoring service
    const scoredPlayers = await calculateAndUpdateScores(
      gameId,
      currentQuestionIndex
    );

    const gameRef = doc(db, 'gameSessions', gameId);
    await updateDoc(gameRef, {
      state: 'answerrevealed',
      updatedAt: serverTimestamp()
    });

    return scoredPlayers;
  } catch (error) {
    console.error("Error revealing answer:", error);
    throw new Error('Error revealing answer.');
  }
};

/**
 * Updates the game state to show the leaderboard.
 */
export const showLeaderboard = async (gameId) => {
  if (!gameId) throw new Error('No game ID provided.');

  try {
    const gameRef = doc(db, 'gameSessions', gameId);
    await updateDoc(gameRef, {
      state: 'leaderboard',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error showing leaderboard:", error);
    throw new Error('Error showing leaderboard.');
  }
};