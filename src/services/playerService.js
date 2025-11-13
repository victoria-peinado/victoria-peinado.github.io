// src/services/playerService.js
import { db } from '../firebase';
// No longer import auth or signInAnonymously
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
// No longer import ADMIN_USER_ID or ../config

/**
 * Creates a player document in Firestore.
 * Assumes the user is already authenticated.
 * @param {string} gameId - The ID of the game to join.
 * @param {string} userId - The authenticated user's UID.
 * @param {string} nickname - The player's chosen nickname.
 * @returns {string} The player's UID.
 */
export const joinGame = async (gameId, userId, nickname) => {
  try {
    // NEW PATH: Uses top-level collection
    const playerRef = doc(
      db,
      `gameSessions/${gameId}/players/${userId}`
    );

    await setDoc(playerRef, {
      nickname: nickname.trim(),
      score: 0,
      joinedAt: serverTimestamp()
    });

    console.log("Player document created");
    return userId;
  } catch (error) {
    console.error("Error joining game:", error);
    throw new Error('Error joining game. Try again!');
  }
};

/**
 * Submits a player's answer to Firestore.
 * @param {object} params - Parameters object.
 * @param {string} params.gameId - The current game ID.
 * @param {string} params.playerId - The player's ID (same as their auth UID).
 * @param {number} params.questionIndex - The index of the current question.
 * @param {string} params.answerLetter - The answer letter (e.g., 'A').
 * @param {boolean} params.isCorrect - Whether the answer is correct.
 */
export const submitAnswer = async ({ gameId, playerId, questionIndex, answerLetter, isCorrect }) => {
  try {
    // NEW PATH: Uses top-level collection
    const answerRef = doc(
      db,
      `gameSessions/${gameId}/answers/${playerId}_q${questionIndex}`
    );

    await setDoc(answerRef, {
      playerId: playerId,
      questionIndex: questionIndex,
      answer: answerLetter,
      correct: isCorrect,
      submittedAt: serverTimestamp()
    });

    console.log("Answer submitted:", answerLetter);
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw new Error('Error submitting answer.');
  }
};