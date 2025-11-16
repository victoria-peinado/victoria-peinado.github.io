// src/hooks/useLivePlayerList.js
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
// UPDATED: Imports from the new playerAdmin service
import { kickPlayer, sendDirectMessage } from '../services/player/playerAdmin';

export function useLivePlayerList(gameId) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerToKick, setPlayerToKick] = useState(null);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    const q = query(
      playersRef, 
      where("hasExited", "==", false),
      where("isKicked", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching live players:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId]);

  const handleKickClick = (player) => {
    setPlayerToKick(player);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPlayerToKick(null);
  };

  const handleConfirmKick = async () => {
    if (!playerToKick) return;

    try {
      // UPDATED: Using the new service function
      await kickPlayer(gameId, playerToKick.id);
    } catch (error) {
      console.error("Error kicking player:", error);
    } finally {
      handleCloseModal();
    }
  };

  const handleMessageClick = async (player) => {
    const message = window.prompt(`Send a direct message to ${player.nickname}:`);
    
    if (message && message.trim()) {
      try {
        // UPDATED: Using the new service function
        await sendDirectMessage(gameId, player.id, message.trim());
        alert('Message sent!');
      } catch (error) {
        console.error('Error sending direct message:', error);
        alert('Failed to send message.');
      }
    }
  };

  return {
    players,
    loading,
    isModalOpen,
    playerToKick,
    handleKickClick,
    handleCloseModal,
    handleConfirmKick,
    handleMessageClick
  };
}