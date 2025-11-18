// src/hooks/useLeaderboard.js
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

export const useLeaderboard = (gameId) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return { leaderboard, loading };
};