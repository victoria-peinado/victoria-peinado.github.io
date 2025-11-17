// src/services/player/playerAuth.js
import { db } from '../../firebase';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc,
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

    // --- 1. Check if this USER (by userId) has already joined. ---
    const playerSnap = await getDoc(playerRef);
    if (playerSnap.exists()) {
      const playerData = playerSnap.data();

      if (playerData.hasExited === true) {
        throw new Error('You cannot rejoin a game you have exited.');
      }
      if (playerData.isKicked === true) {
        throw new Error('You cannot rejoin a game you have been kicked from.');
      }

      // If they exist and haven't exited or been kicked, they are *already in*.
      // This join attempt is from a second device or an unnecessary form resubmit.
      // The "page refresh" logic is handled by localStorage in PlayerPage.jsx,
      // so we can safely block this.
      throw new Error(
        "You are already in this game. If you're on the same device, refresh the page."
      );
    }

    // --- 2. Check if the NICKNAME is taken by SOMEONE ELSE. ---
    // (We know this user is new, so any match is guaranteed to be another player)
    const q = query(playersRef, where('nickname', '==', trimmedNickname));
    const nicknameSnapshot = await getDocs(q);

    if (!nicknameSnapshot.empty) {
      throw new Error(
        `Nickname "${trimmedNickname}" is already taken! Please choose another.`
      );
    }

    // --- 3. If all checks pass, create the new player document. ---
    await setDoc(playerRef, {
      userId: userId, // <-- SPRINT 14: Added to link to permanent profile
      nickname: trimmedNickname,
      score: 0,
      joinedAt: serverTimestamp(),
      hasExited: false,
      isKicked: false,
      // SPRINT 14: Add fields for in-game stat tracking
      questionsCorrect: 0,
      totalAnswerTimeMs: 0,
    });
    // No { merge: true } needed, since this is a brand new doc.

    console.log('Player document created with userId');
    return userId;
  } catch (error) {
    console.error('Error joining game:', error);
    throw error; // Re-throw to preserve the error message
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
      hasExited: true,
    });
    console.log(`Player ${playerId} flagged as exited from game ${gameId}`);
  } catch (error) {
    console.error('Error flagging player as exited:', error);
  }
};