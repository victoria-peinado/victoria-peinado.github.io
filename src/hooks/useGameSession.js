import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Custom hook to listen to a specific game session in real-time.
 * @param {string} gameId - The ID of the game session to listen to.
 * @returns { gameSession, loading, error }
 */
export function useGameSession(gameId) {
  const [gameSession, setGameSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      setGameSession(null);
      // Not an error, just no gameId provided
      return;
    }

    console.log(`Setting up listener for game: ${gameId}`);
    setLoading(true);

    // NEW PATH: Listens to the top-level 'gameSessions' collection
    const gameSessionRef = doc(db, 'gameSessions', gameId);

    const unsubscribe = onSnapshot(
      gameSessionRef,
      (gameSnapshot) => {
        if (gameSnapshot.exists()) {
          const gameData = {
            id: gameSnapshot.id,
            ...gameSnapshot.data()
          };
          setGameSession(gameData);
          setError(null);
        } else {
          setGameSession(null);
          setError("Game session not found");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to game session:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log("Cleaning up game session listener");
      unsubscribe();
    };
  }, [gameId]); // Re-run if gameId changes

  return { gameSession, loading, error };
}