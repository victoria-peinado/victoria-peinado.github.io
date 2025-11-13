import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Leaderboard({ gameId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId]);

  if (loading) {
    return (
      <div className="text-center text-white">
        <p className="text-xl">Loading leaderboard...</p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white bg-opacity-10 rounded-lg p-8 text-center">
        <p className="text-white text-xl">No players yet!</p>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = leaderboard.map((player, index) => ({
    name: player.nickname,
    score: player.score || 0,
    rank: index + 1
  }));

  const getBarColor = (rank) => {
    switch(rank) {
      case 1: return '#fbbf24'; // Gold
      case 2: return '#9ca3af'; // Silver
      case 3: return '#fb923c'; // Bronze
      default: return '#60a5fa'; // Blue
    }
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-lg p-6 w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Current Standings
      </h2>
      <ResponsiveContainer width="100%" height={Math.max(400, leaderboard.length * 50)}>
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
          <XAxis type="number" stroke="#ffffff" />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#ffffff"
            width={150}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff'
            }}
          />
          <Bar dataKey="score" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.rank)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}