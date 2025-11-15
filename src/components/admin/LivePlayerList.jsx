// src/components/admin/LivePlayerList.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
// UPDATED: Import 'where'
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import * as playerService from '../../services/playerService'; // <-- 1. IMPORT
import ConfirmModal from '../common/ConfirmModal'; // <-- 2. IMPORT

export default function LivePlayerList({ gameId }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 3. ADD STATE FOR MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerToKick, setPlayerToKick] = useState(null);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    // UPDATED: Add 'where' clauses to hide exited AND kicked players
    const q = query(
      playersRef, 
      where("hasExited", "==", false),
      where("isKicked", "==", false) // <-- ADD THIS
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playersData);
      setLoading(false);
    }, (error) => { // Add error handling
      console.error("Error fetching live players:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId]);

  // --- 4. ADD MODAL HANDLERS ---
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
      await playerService.kickPlayer(gameId, playerToKick.id);
      // The onSnapshot listener will automatically remove the 
      // player from the UI because of the query update.
    } catch (error) {
      console.error("Error kicking player:", error);
      // You could show an error message to the admin here
    } finally {
      handleCloseModal();
    }
  };

  // --- 1. ADD HANDLER FOR DIRECT MESSAGE ---
  const handleMessageClick = async (player) => {
    const message = window.prompt(`Send a direct message to ${player.nickname}:`);
    
    if (message && message.trim()) {
      try {
        await playerService.sendDirectMessage(gameId, player.id, message.trim());
        // You could show a success toast here if you have one
        alert('Message sent!');
      } catch (error) {
        console.error('Error sending direct message:', error);
        alert('Failed to send message.');
      }
    }
  };


  if (loading) {
    return <div className="text-gray-600">Loading players...</div>;
  }

  // --- 5. UPDATE JSX ---
  return (
    <>
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-mono">
                    {player.score || 0} pts
                  </span>
                  
                  {/* --- 2. ADD MESSAGE BUTTON --- */}
                  <button
                    onClick={() => handleMessageClick(player)}
                    className="bg-blue-500 text-white px-3 py-1 text-xs rounded shadow hover:bg-blue-600 transition"
                  >
                    Message
                  </button>
                  
                  {/* --- ADD KICK BUTTON --- */}
                  <button
                    onClick={() => handleKickClick(player)}
                    className="bg-red-500 text-white px-3 py-1 text-xs rounded shadow hover:bg-red-600 transition"
                  >
                    Kick
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- ADD MODAL RENDER --- */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmKick}
        title="Kick Player?"
        message={`Are you sure you want to kick ${playerToKick?.nickname}? They will be removed from the game.`}
        confirmText="Kick"
        confirmVariant="danger"
      />
    </>
  );
}