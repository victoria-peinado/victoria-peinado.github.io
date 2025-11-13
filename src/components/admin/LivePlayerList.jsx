import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

export default function LivePlayerList({ gameId }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    const q = query(playersRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId]);

  if (loading) {
    return <div className="text-gray-600">Loading players...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">
        Live Players ({players.length})
      </h2>
      
      {players.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No players have joined yet.
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-semibold text-gray-800">
                  {player.nickname}
                </span>
              </div>
              <span className="text-sm text-gray-600 font-mono">
                {player.score || 0} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}