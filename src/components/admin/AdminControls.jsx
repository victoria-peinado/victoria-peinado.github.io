// src/components/admin/AdminControls.jsx
import React from 'react';
import { Button } from '../ui/Button';

function AdminControls({
  onShowQuestion,
  onShowLeaderboard,
  onEndGame,
  gameSession,
  isBusy,
}) {
  const gameState = gameSession?.state;

  return (
    <div className="space-y-3">
      <Button
        onClick={onShowQuestion}
        disabled={isBusy || gameState === 'finished' || gameState === 'questionactive'}
        variant="primary"
        className="w-full py-3"
      >
        {gameState === 'waiting' ? 'Start Game' : 'Next Question'}
      </Button>

      <Button
        onClick={onShowLeaderboard}
        disabled={isBusy || (gameState !== 'answerrevealed' && gameState !== 'leaderboard')}
        variant="secondary"
        className="w-full py-3"
      >
        Show Leaderboard
      </Button>

      <Button
        onClick={onEndGame}
        disabled={isBusy || gameState === 'finished'}
        variant="danger"
        className="w-full py-3"
      >
        End Game
      </Button>

      {/* Status Messages */}
      {gameState === 'questionactive' && (
        <div className="mt-4 p-4 bg-primary-dark rounded-lg border border-primary">
          <p className="text-primary-light font-semibold text-center">
            Timer is running...
          </p>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="mt-4 p-4 bg-neutral-800 rounded-lg border border-primary-light">
          <p className="text-primary-light font-semibold text-center">
            Game has ended!
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminControls;