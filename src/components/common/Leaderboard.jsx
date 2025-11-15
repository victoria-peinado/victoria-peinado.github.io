import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'; // 1. Import LabelList

export default function Leaderboard({ gameId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (useEffect logic is unchanged) ...
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

  // ... (loading and empty states are unchanged) ...
  if (loading) {
    return (
      <div className="text-center text-white p-8">
        <p className="text-xl">Loading leaderboard...</p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-black bg-opacity-30 rounded-lg p-12 text-center">
        <p className="text-white text-2xl font-light">
          No players have scored yet!
        </p>
      </div>
    );
  }

  const chartData = leaderboard.map((player, index) => ({
    name: player.nickname,
    score: player.score || 0,
    rank: index + 1
  }));

  const getBarColor = (rank) => {
    // ... (getBarColor logic is unchanged) ...
    switch(rank) {
      case 1: return '#fbbf24'; 
      case 2: return '#c0c0c0'; 
      case 3: return '#cd7f32'; 
      default: return '#3b82f6';
    }
  };

  return (
    <div className="bg-black bg-opacity-30 rounded-lg p-6 w-full max-w-4xl mx-auto backdrop-blur-sm">
      <h2 className="text-4xl font-bold text-white mb-8 text-center">
        Current Standings
      </h2>
      
      {/* 2. Set fixed height and remove layout="vertical" */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={chartData} 
          margin={{ top: 30, right: 30, left: 20, bottom: 5 }} // 3. Give space for top label
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" vertical={false} />
          
          {/* 4. XAxis is now 'name' (category) */}
          <XAxis 
            dataKey="name" 
            stroke="#ffffff" 
            tick={{ fill: '#ffffff' }}
          />
          
          {/* 5. YAxis is now for score (number) */}
          <YAxis 
            stroke="#ffffff" 
            tick={{ fill: '#ffffff' }}
          />

          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            cursor={{ fill: '#ffffff10' }}
          />
          <Bar dataKey="score" radius={[8, 8, 0, 0]}> {/* 6. Update radius for vertical bars */}
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.rank)} />
            ))}
            
            {/* 7. Add score labels to the top of each bar */}
            <LabelList 
              dataKey="score" 
              position="top" 
              style={{ fill: '#ffffff', fontSize: '14px' }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}