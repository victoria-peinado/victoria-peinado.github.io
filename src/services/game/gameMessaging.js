// src/services/game/gameMessaging.js
import { db } from '../../firebase';
import { 
  doc, 
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';

/**
 * Sends a broadcast message to all players in the game.
 * @param {string} gameId - The game session ID.
 * @param {string} message - The message content.
 */
export const sendBroadcast = async (gameId, message) => {
  if (!gameId || !message) throw new Error('Game ID and message are required.');

  try {
    const gameRef = doc(db, 'gameSessions', gameId);
    await updateDoc(gameRef, {
      broadcastMessage: {
        message: message,
        sentAt: serverTimestamp() // Use a timestamp to identify new messages
      }
    });
    console.log(`Broadcast message sent to game ${gameId}`);
  } catch (error) {
    console.error("Error sending broadcast message:", error);
    throw new Error('Failed to send broadcast message.');
  }
};