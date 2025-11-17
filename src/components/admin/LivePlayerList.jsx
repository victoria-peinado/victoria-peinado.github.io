import React from 'react';
import ConfirmModal from '../common/ConfirmModal';
import { useLivePlayerList } from '../../hooks/useLivePlayerList';
// Button is no longer used directly, so its import is removed
import PlayerRow from './PlayerRow'; // 1. Import the new PlayerRow component

export default function LivePlayerList({ gameId }) {
  const {
    players,
    loading,
    isModalOpen,
    playerToKick,
    handleKickClick,
    handleCloseModal,
    handleConfirmKick,
    handleMessageClick
  } = useLivePlayerList(gameId);

  if (loading) {
    return <div className="text-neutral-400">Loading players...</div>;
  }

  return (
    <>
      <div>
        <p className="text-sm text-neutral-400 mb-4">
          {players.length} {players.length === 1 ? 'player' : 'players'} online
        </p>
        
        {players.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">
            No players have joined yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {/* 2. Use the new PlayerRow component */}
            {players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                onMessageClick={handleMessageClick} // Pass the handler
                onKickClick={handleKickClick}       // Pass the handler
              />
            ))}
          </div>
        )}
      </div>

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