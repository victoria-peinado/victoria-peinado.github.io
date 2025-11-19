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
 */
export const joinGame = async (gameId, userId, nickname, isAnonymous) => {
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
      if (playerData.isKKicked === true) {
        throw new Error('You cannot rejoin a game you have been kicked from.');
      }

      throw new Error(
        "You are already in this game. If you're on the same device, refresh the page."
      );
    }

    // --- 2. Check if the NICKNAME is taken by SOMEONE ELSE. ---
    const q = query(playersRef, where('nickname', '==', trimmedNickname));
    const nicknameSnapshot = await getDocs(q);

    if (!nicknameSnapshot.empty) {
      throw new Error(
        `Nickname "${trimmedNickname}" is already taken! Please choose another.`
      );
    }

    // --- 3. If all checks pass, create the new player document. ---
    await setDoc(playerRef, {
      // CRITICAL: This field determines if the profile service can update stats
      userId: userId, 
      nickname: trimmedNickname,
      score: 0,
      joinedAt: serverTimestamp(),
      hasExited: false,
      isKicked: false,
      questionsCorrect: 0,
      totalAnswerTimeMs: 0,
      isAnonymous: isAnonymous, // Added Sprint 16
    });

    console.log('Player document created with userId');
    return userId;
  } catch (error) {
    console.error('Error joining game:', error);
    throw error;
  }
};

/**
 * Flags a player as having exited the game.
 */
export const handleExitGame = async (gameId, playerId) => {
  if (!gameId || !playerId) return;

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