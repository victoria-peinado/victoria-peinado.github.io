// src/services/player/playerAdmin.js
import { db } from '../../firebase';
import { 
  doc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Kicks a player from the game by setting an 'isKicked' flag.
 * @param {string} gameId - The ID of the game.
 * @param {string} playerId - The ID of the player to kick.
 */
export const kickPlayer = async (gameId, playerId) => {
  if (!gameId || !playerId) throw new Error('Game ID and Player ID are required.');

  try {
    const playerRef = doc(db, `gameSessions/${gameId}/players/${playerId}`);
    await updateDoc(playerRef, {
      isKicked: true
    });
    console.log(`Player ${playerId} flagged as kicked from game ${gameId}`);
  } catch (error) {
    console.error("Error kicking player:", error);
    throw new Error('Failed to kick player.');
  }
};

/**
 * Sends a direct message to a specific player.
 * @param {string} gameId - The ID of the game.
 * @param {string} playerId - The ID of the player to message.
 * @param {string} message - The message content.
 */
export const sendDirectMessage = async (gameId, playerId, message) => {
  if (!gameId || !playerId || !message) throw new Error('Game ID, Player ID, and message are required.');

  try {
    const playerRef = doc(db, `gameSessions/${gameId}/players/${playerId}`);
    await updateDoc(playerRef, {
      directMessage: {
        message: message,
        sentAt: serverTimestamp() // Use a timestamp
      }
    });
    console.log(`Direct message sent to player ${playerId}`);
  } catch (error) {
    console.error("Error sending direct message:", error);
    throw new Error('Failed to send direct message.');
  }
};