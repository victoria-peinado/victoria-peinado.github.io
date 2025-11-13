import React, { useState, useEffect } from 'react';
// import { useActiveGameSession } from '../../hooks/useActiveGameSession'; // No longer needed
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
// import { ADMIN_USER_ID } from '../../config'; // No longer needed

// This component now takes gameId as a prop
export default function Leaderboard({ gameId }) {
  // const { gameSession } = useActiveGameSession(); // No longer needed
  const [leaderboard, setLeaderboard] = useState([]); // <-- FIX: Was 'auto');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We now use the gameId prop instead of gameSession
    if (!gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // NEW PATH: Uses the top-level 'gameSessions' collection
    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    
    const q = query(
      playersRef, 
      orderBy('score', 'desc'),
      limit(10) 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaderboard(playersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard: ", error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();

  }, [gameId]); // Reruns if gameId changes

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-900 text-white">
        <h1 className="text-5xl font-bold text-white animate-pulse">Loading Leaderboard...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-yellow-900 via-gray-900 to-orange-900 text-white">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-7xl font-bold mb-4 text-white">Leaderboard</h1>
        </div>

        <div className="space-y-4">
          {leaderboard.length === 0 && (
            <div className="text-center text-gray-300 text-2xl">
              No players have scored yet!
            </div>
          )}
          
          {leaderboard.map((player, index) => (
            <div
              key={player.id}
              className={`
                flex items-center justify-between p-6 rounded-xl transition-all
                ${index === 0 ? 'bg-yellow-500 text-gray-900 scale-105 shadow-2xl' : 
                  index === 1 ? 'bg-gray-400 text-gray-900' : 
                  index === 2 ? 'bg-yellow-700 text-white' : 
                  'bg-gray-700 text-white'}
              `}
            >
              <div className="flex items-center gap-6">
                <div className="text-5xl font-bold w-16 text-left">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="text-3xl font-bold">{player.nickname}</div>
              </div>
              <div className="text-4xl font-bold">{player.score}</div>
            </div>
          ))}
        </div>

        {/* FIX: Removed the redundant Game ID from this component.
            The 5-digit PIN is now shown in the StreamPage footer.
        */}
      </div>
    </div>
  );
}