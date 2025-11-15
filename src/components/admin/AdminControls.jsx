// src/components/admin/AdminControls.jsx
import React from 'react';

function AdminControls({
  onShowQuestion,
  onShowLeaderboard,
  onEndGame,
  gameSession,
  isBusy,
}) {
  const gameState = gameSession?.state;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Game Controls</h2>
      
      <div className="space-y-3">
        <button
          onClick={onShowQuestion}
          disabled={isBusy || gameState === 'finished' || gameState === 'questionactive'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {gameState === 'waiting' ? 'Start Game' : 'Next Question'}
        </button>

        <button
          onClick={onShowLeaderboard}
          disabled={isBusy || (gameState !== 'answerrevealed' && gameState !== 'leaderboard')}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          Show Leaderboard
        </button>

        <button
          onClick={onEndGame}
          disabled={isBusy || gameState === 'finished'}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          End Game
        </button>
      </div>

      {gameState === 'questionactive' && (
        <div className="mt-4 p-4 bg-blue-100 rounded-lg">
          <p className="text-blue-800 font-semibold text-center">
            Timer is running...
          </p>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 font-semibold text-center">
            Game has ended!
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminControls;