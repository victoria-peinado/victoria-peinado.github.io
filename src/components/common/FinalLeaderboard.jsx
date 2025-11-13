import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function FinalLeaderboard({ gameId }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    const q = query(playersRef, orderBy('score', 'desc'));

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
    return <div className="text-white text-center text-xl">Loading final results...</div>;
  }

  if (players.length === 0) {
    return <div className="text-white text-center text-xl">No players found.</div>;
  }

  const topThree = players.slice(0, 3);

  // Prepare data for chart
  const chartData = players.map((player, index) => ({
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

  const getMedalEmoji = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Celebration Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-white mb-4">
          Game Complete!
        </h1>
        <p className="text-2xl text-purple-200">
          Congratulations to all players!
        </p>
      </div>

      {/* Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Top Champions
          </h2>
          
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="flex flex-col items-center">
                <div className="text-6xl mb-2">{getMedalEmoji(2)}</div>
                <div style={{
                  background: 'linear-gradient(to bottom, #d1d5db, #9ca3af)',
                  height: '180px',
                  width: '160px'
                }} className="rounded-t-lg p-6 text-center shadow-xl">
                  <div className="text-white font-bold text-xl mb-2 truncate">
                    {topThree[1].nickname}
                  </div>
                  <div className="text-white text-3xl font-bold">
                    {topThree[1].score}
                  </div>
                  <div className="text-gray-200 text-sm">points</div>
                </div>
                <div className="bg-gray-400 w-full h-8 rounded-b-lg flex items-center justify-center text-white font-bold">
                  2nd
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="flex flex-col items-center">
                <div className="text-7xl mb-2">{getMedalEmoji(1)}</div>
                <div style={{
                  background: 'linear-gradient(to bottom, #fde047, #eab308)',
                  height: '220px',
                  width: '180px'
                }} className="rounded-t-lg p-6 text-center shadow-2xl">
                  <div className="text-yellow-900 font-bold text-2xl mb-2 truncate">
                    {topThree[0].nickname}
                  </div>
                  <div className="text-yellow-900 text-4xl font-bold">
                    {topThree[0].score}
                  </div>
                  <div className="text-yellow-800 text-sm">points</div>
                </div>
                <div style={{ background: '#eab308' }} className="w-full h-10 rounded-b-lg flex items-center justify-center text-yellow-900 font-bold text-lg">
                  WINNER
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="flex flex-col items-center">
                <div className="text-6xl mb-2">{getMedalEmoji(3)}</div>
                <div style={{
                  background: 'linear-gradient(to bottom, #fdba74, #f97316)',
                  height: '150px',
                  width: '160px'
                }} className="rounded-t-lg p-6 text-center shadow-xl">
                  <div className="text-white font-bold text-xl mb-2 truncate">
                    {topThree[2].nickname}
                  </div>
                  <div className="text-white text-3xl font-bold">
                    {topThree[2].score}
                  </div>
                  <div className="text-orange-200 text-sm">points</div>
                </div>
                <div style={{ background: '#f97316' }} className="w-full h-8 rounded-b-lg flex items-center justify-center text-white font-bold">
                  3rd
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bar Chart */}
      <div className="bg-white bg-opacity-10 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Final Scores
        </h3>
        <ResponsiveContainer width="100%" height={Math.max(400, players.length * 50)}>
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
    </div>
  );
}