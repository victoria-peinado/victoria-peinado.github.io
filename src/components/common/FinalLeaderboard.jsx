// src/components/common/FinalLeaderboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import Confetti from 'react-confetti';
import { useAudio } from '../../hooks/useAudio'; // 1. Import useAudio

// A simple hook to get window dimensions
function useWindowSize() {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}

export default function FinalLeaderboard({ gameId }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [width, height] = useWindowSize();
  const { playSound, setMusic } = useAudio(); // 2. Get audio functions

  // 3. Add new useEffect for audio
  useEffect(() => {
    playSound('fanfare');
    setMusic('music_lobby.mp3'); // Set music back to lobby/calm track

    // We only want this to run once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount

  // Existing useEffect for data fetching
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
    // 6. Use "Primal Mana" theme colors
    switch(rank) {
      case 1: return '#619A5A'; // Primary (Green)
      case 2: return '#F5F5DC'; // Accent White (Parchment)
      case 3: return '#4E342E'; // Neutral 700 (Stone)
      default: return '#0D47A1'; // Accent Blue
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
    <div className="w-full max-w-6xl mx-auto relative">
      <Confetti
        width={width}
        height={height}
        recycle={false} // Run once and stop
        numberOfPieces={400}
        gravity={0.1}
      />

      {/* Celebration Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-display font-bold text-primary-light mb-4">
          Game Complete!
        </h1>
        <p className="text-2xl text-neutral-200">
          Congratulations to all players!
        </p>
      </div>

      {/* Podium for Top 3 (Re-themed) */}
      {topThree.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold text-center text-neutral-100 mb-8">
            Top Champions
          </h2>
          
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="flex flex-col items-center">
                <div className="text-6xl mb-2">{getMedalEmoji(2)}</div>
                <div className="bg-neutral-200 h-[150px] w-[150px] rounded-t-lg p-4 text-center shadow-xl">
                  <div className="text-black font-bold text-xl mb-2 truncate">
                    {topThree[1].nickname}
                  </div>
                  <div className="text-black text-3xl font-bold">
                    {topThree[1].score}
                  </div>
                  <div className="text-gray-800 text-sm">points</div>
                </div>
                <div className="bg-neutral-300 w-full h-8 rounded-b-lg flex items-center justify-center text-neutral-700 font-bold">
                  2nd
                </div>
              </div>
            )}

            {/* 1st Place (Primary Color) */}
            {topThree[0] && (
              <div className="flex flex-col items-center">
                <div className="text-7xl mb-2">{getMedalEmoji(1)}</div>
                <div className="bg-primary-light h-[180px] w-[170px] rounded-t-lg p-4 text-center shadow-2xl">
                  <div className="text-black font-bold text-2xl mb-2 truncate">
                    {topThree[0].nickname}
                  </div>
                  <div className="text-black text-4xl font-bold">
                    {topThree[0].score}
                  </div>
                  <div className="text-gray-900 text-sm">points</div>
                </div>
                <div className="bg-primary w-full h-10 rounded-b-lg flex items-center justify-center text-white font-bold text-lg">
                  WINNER
                </div>
              </div>
            )}

            {/* 3rd Place (Stone/Wood Color) */}
            {topThree[2] && (
              <div className="flex flex-col items-center">
                <div className="text-6xl mb-2">{getMedalEmoji(3)}</div>
                <div className="bg-neutral-700 border-2 border-neutral-700 h-[120px] w-[150px] rounded-t-lg p-4 text-center shadow-xl">
                  <div className="text-neutral-100 font-bold text-xl mb-2 truncate">
                    {topThree[2].nickname}
                  </div>
                  <div className="text-white text-3xl font-bold">
                    {topThree[2].score}
                  </div>
                  <div className="text-neutral-300 text-sm">points</div>
                </div>
                <div className="bg-neutral-700 w-full h-8 rounded-b-lg flex items-center justify-center text-white font-bold">
                  3rd
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bar Chart (Re-themed) */}
      <div className="bg-neutral-800 border-2 border-neutral-700 rounded-lg p-6">
        <h3 className="text-2xl font-display font-bold text-white mb-6 text-center">
          Final Scores
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData} 
            margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4E342E" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#F5F5DC" 
              tick={{ fill: '#F5F5DC', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              interval={'auto'}
            />
            <YAxis 
              stroke="#F5F5DC" 
              tick={{ fill: '#F5F5DC' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#212121', 
                border: '1px solid #4E342E',
                borderRadius: '8px',
                color: '#F5F5DC'
              }}
            />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.rank)} />
              ))}
              <LabelList 
                dataKey="score" 
                position="top" 
                style={{ fill: '#F5F5DC', fontSize: '14px', fontWeight: 'bold' }} // Changed to Parchment
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}