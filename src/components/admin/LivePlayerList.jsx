import React from 'react';
import ConfirmModal from '../common/ConfirmModal';
import { useLivePlayerList } from '../../hooks/useLivePlayerList';
import PlayerRow from './PlayerRow';

// 1. NEW: Skeleton component for the loading state
// This mimics the shape of a PlayerRow
const PlayerRowSkeleton = () => (
  <div className="flex items-center justify-between p-4 h-20 bg-neutral-800 rounded-lg animate-pulse">
    <div className="flex flex-col space-y-2">
      <div className="h-4 w-32 bg-neutral-700 rounded"></div>
      <div className="h-3 w-24 bg-neutral-700 rounded"></div>
    </div>
    <div className="flex gap-2">
      <div className="h-8 w-16 bg-neutral-700 rounded"></div>
      <div className="h-8 w-16 bg-neutral-700 rounded"></div>
    </div>
  </div>
);

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

  // 2. UPDATED: The loading block now shows the skeletons
  if (loading) {
    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {/* Render 5 skeletons as placeholders */}
        {[...Array(5)].map((_, i) => (
          <PlayerRowSkeleton key={i} />
        ))}
      </div>
    );
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