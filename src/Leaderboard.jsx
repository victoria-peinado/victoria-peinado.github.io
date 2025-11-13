import React, { useState, useEffect } from 'react';
import { useActiveGameSession } from './hooks/useActiveGameSession';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { ADMIN_USER_ID } from './config';

// This component fetches and displays the live leaderboard
export default function Leaderboard() {
  const { gameSession } = useActiveGameSession();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameSession?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const playersRef = collection(db, `users/${ADMIN_USER_ID}/gameSessions/${gameSession.id}/players`);
    
    // Query for players, ordered by score descending, limit to top 10
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

  }, [gameSession?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-5xl font-bold text-white">Loading Leaderboard...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-7xl font-bold mb-4 text-white">Leaderboard</h1>
        </div>

        <div className="space-y-4">
          {leaderboard.length === 0 && (
            <div className="text-center text-gray-400 text-2xl">
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

        <div className="text-center mt-12 text-gray-400 text-sm">
          Game ID: {gameSession.id.slice(0, 8)}...
        </div>
      </div>
    </div>
  );
}