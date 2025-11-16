// src/components/admin/LivePlayerList.jsx
import React from 'react';
import ConfirmModal from '../common/ConfirmModal';
import { useLivePlayerList } from '../../hooks/useLivePlayerList';
import { Button } from '../ui/Button';

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
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition border border-neutral-700"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-2 h-2 bg-primary-light rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-100 truncate">
                      {player.nickname}
                    </p>
                    <p className="text-xs text-neutral-400 font-mono">
                      {player.score || 0} pts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={() => handleMessageClick(player)}
                    variant="secondary"
                    className="py-1 px-3 text-xs"
                  >
                    Message
                  </Button>
                  
                  <Button
                    onClick={() => handleKickClick(player)}
                    variant="danger"
                    className="py-1 px-3 text-xs"
                  >
                    Kick
                  </Button>
                </div>
              </div>
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