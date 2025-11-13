// src/services/playerService.js
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Creates a player document in Firestore after checking nickname uniqueness.
 * @param {string} gameId - The ID of the game to join.
 * @param {string} userId - The authenticated user's UID.
 * @param {string} nickname - The player's chosen nickname.
 * @returns {string} The player's UID.
 */
export const joinGame = async (gameId, userId, nickname) => {
  try {
    const trimmedNickname = nickname.trim();

    // Check if nickname is already taken in this game
    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    const q = query(playersRef, where('nickname', '==', trimmedNickname));
    const snapshot = await getDocs(q);

    // If nickname exists and it's NOT the current user, reject
    if (!snapshot.empty) {
      const existingPlayer = snapshot.docs[0];
      if (existingPlayer.id !== userId) {
        throw new Error(`Nickname "${trimmedNickname}" is already taken! Please choose another.`);
      }
      // If it IS the current user, allow them to rejoin
      console.log('Player rejoining with same nickname');
    }

    // Create or update player document
    const playerRef = doc(db, `gameSessions/${gameId}/players/${userId}`);
    await setDoc(playerRef, {
      nickname: trimmedNickname,
      score: 0,
      joinedAt: serverTimestamp()
    });

    console.log("Player document created/updated");
    return userId;
  } catch (error) {
    console.error("Error joining game:", error);
    throw error; // Re-throw to preserve the error message
  }
};

/**
 * Submits a player's answer to Firestore.
 */
export const submitAnswer = async ({ gameId, playerId, questionIndex, answerLetter, isCorrect }) => {
  try {
    const answerRef = doc(db, `gameSessions/${gameId}/answers/${playerId}_q${questionIndex}`);
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