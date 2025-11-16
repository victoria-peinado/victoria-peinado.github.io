// src/services/player/playerGameplay.js
import { db } from '../../firebase';
import { 
  doc, 
  setDoc, 
  serverTimestamp
} from 'firebase/firestore';

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