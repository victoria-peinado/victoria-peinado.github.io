// src/services/playerService.js
import { db } from '../firebase';
// UPDATED: Import doc, getDoc, updateDoc
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  getDoc
} from 'firebase/firestore';

/**
 * Creates or updates a player document in Firestore after checking for uniqueness.
 * @param {string} gameId - The ID of the game to join.
 * @param {string} userId - The authenticated user's UID.
 * @param {string} nickname - The player's chosen nickname.
 * @returns {string} The player's UID.
 */
export const joinGame = async (gameId, userId, nickname) => {
  try {
    const trimmedNickname = nickname.trim();
    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    const playerRef = doc(db, `gameSessions/${gameId}/players/${userId}`);

    // --- NEW LOGIC ---
    // 1. Check if this USER has already joined and exited.
    const playerSnap = await getDoc(playerRef);
    if (playerSnap.exists() && playerSnap.data().hasExited === true) {
      throw new Error("You cannot rejoin a game you have exited.");
    }
    // --- END NEW LOGIC ---

    // 2. Check if the NICKNAME is taken by SOMEONE ELSE.
    const q = query(playersRef, where('nickname', '==', trimmedNickname));
    const nicknameSnapshot = await getDocs(q);

    if (!nicknameSnapshot.empty) {
      const existingPlayer = nicknameSnapshot.docs[0];
      if (existingPlayer.id !== userId) {
        // Nickname is taken by a different user
        throw new Error(`Nickname "${trimmedNickname}" is already taken! Please choose another.`);
      }
      // If it IS the current user, that's fine. We already know they
      // haven't exited (from step 1), so they are just re-joining
      // (e.g., after a page refresh) or submitting the form again.
      console.log('Player re-confirming join with same nickname');
    }

    // 3. If all checks pass, create or update the player document.
    await setDoc(playerRef, {
      nickname: trimmedNickname,
      score: 0,
      joinedAt: serverTimestamp(),
      hasExited: false // Set/reset hasExited to false
    }, { merge: true }); // Use merge to not overwrite score on refresh

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

/**
 * Flags a player as having exited the game.
 * @param {string} gameId - The ID of the game.
 * @param {string} playerId - The authenticated user's UID.
 */
export const handleExitGame = async (gameId, playerId) => {
  if (!gameId || !playerId) return; // Safety check

  try {
    const playerRef = doc(db, `gameSessions/${gameId}/players/${playerId}`);
    await updateDoc(playerRef, {
      hasExited: true
    });
    console.log(`Player ${playerId} flagged as exited from game ${gameId}`);
  } catch (error) {
    console.error("Error flagging player as exited:", error);
  }
};