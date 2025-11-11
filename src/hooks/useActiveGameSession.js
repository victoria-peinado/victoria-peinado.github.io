import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ADMIN_USER_ID } from '../config';

/**
 * Custom hook to listen to the active game session in real-time
 * Returns: { gameSession, loading, error }
 */
export function useActiveGameSession() {
  const [gameSession, setGameSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(" useActiveGameSession: Setting up listeners...");

    // Step 1: Listen to the admin user document to get activeGameSessionId
    const adminUserRef = doc(db, `users/${ADMIN_USER_ID}`);
    
    const unsubscribeUser = onSnapshot(
      adminUserRef,
      (userSnapshot) => {
        if (!userSnapshot.exists()) {
          console.error(" Admin user document doesn't exist");
          setError("Admin user not found");
          setLoading(false);
          return;
        }

        const userData = userSnapshot.data();
        const activeGameSessionId = userData?.activeGameSessionId;

        console.log(" Active game session ID:", activeGameSessionId);

        if (!activeGameSessionId) {
          // No active game yet
          console.log(" No active game session");
          setGameSession(null);
          setLoading(false);
          return;
        }

        // Step 2: Listen to the active game session document
        const gameSessionRef = doc(
          db,
          `users/${ADMIN_USER_ID}/gameSessions/${activeGameSessionId}`
        );

        const unsubscribeGame = onSnapshot(
          gameSessionRef,
          (gameSnapshot) => {
            if (gameSnapshot.exists()) {
              const gameData = {
                id: gameSnapshot.id,
                ...gameSnapshot.data()
              };
              console.log(" Game session data:", gameData);
              setGameSession(gameData);
              setError(null);
            } else {
              console.error(" Game session document doesn't exist");
              setGameSession(null);
              setError("Game session not found");
            }
            setLoading(false);
          },
          (err) => {
            console.error(" Error listening to game session:", err);
            setError(err.message);
            setLoading(false);
          }
        );

        // Store the game listener so we can clean it up
        return unsubscribeGame;
      },
      (err) => {
        console.error(" Error listening to admin user:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log(" Cleaning up game session listeners");
      unsubscribeUser();
    };
  }, []); // Empty dependency array - only run once on mount

  return { gameSession, loading, error };
}