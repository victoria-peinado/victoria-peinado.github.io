// src/components/common/Leaderboard.jsx
import React, { useState, useEffect, memo } from 'react'; // 1. Import memo
import { useTranslation } from 'react-i18next';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

// 2. Wrap the component function in memo()
export default memo(function Leaderboard({ gameId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    const q = query(playersRef, orderBy('score', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaderboard(playersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [gameId]);

  const getBarColor = (rank) => {
    switch(rank) {
      case 1: return '#619A5A'; // Primary (Green)
      case 2: return '#F5F5DC'; // Accent White (Parchment)
      case 3: return '#4E342E'; // Neutral 700 (Stone)
      default: return '#0D47A1'; // Accent Blue
    }
  };

  if (loading) {
    return <div className="text-center text-neutral-100 p-8"><p className="text-xl">{t('leaderboard.loading')}</p></div>;
  }
  if (leaderboard.length === 0) {
    return (
      <div className="bg-neutral-800 bg-opacity-50 rounded-lg p-12 text-center">
        <p className="text-neutral-100 text-2xl font-light">{t('leaderboard.noScores')}</p>
      </div>
    );
  }

  const chartData = leaderboard.map((player, index) => ({
    name: player.nickname,
    score: player.score || 0,
    rank: index + 1
  }));

  return (
    <div className="bg-neutral-800 bg-opacity-70 rounded-lg p-6 w-full max-w-4xl mx-auto 
                    border-2 border-neutral-700 backdrop-blur-sm">
      <h2 className="text-4xl font-display font-bold text-neutral-100 mb-8 text-center">
        {t('leaderboard.standings')}
      </h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4E342E" vertical={false} />
          
          <XAxis dataKey="name" stroke="#F5F5DC" tick={{ fill: '#F5F5DC' }} />
          <YAxis stroke="#F5F5DC" tick={{ fill: '#F5F5DC' }} />

          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#212121', // accent-black
              border: '1px solid #4E342E', // neutral-700
              borderRadius: '8px',
              color: '#F5F5DC' // neutral-100
            }}
            cursor={{ fill: '#F5F5DC10' }} // parchment, 10% opacity
          />
          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.rank)} />
            ))}
            <LabelList 
              dataKey="score" 
              position="top" 
              style={{ fill: '#F5F5DC', fontSize: '14px' }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});