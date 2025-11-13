// src/components/admin/AdminControls.jsx
import React from 'react';

// This is now a "dumb" component.
// It receives all handlers and state as props.
function AdminControls({
  onShowQuestion,
  onRevealAnswer,
  onShowLeaderboard,
  gameSession,
  isBusy,
}) {
  const gameState = gameSession?.state;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <button
        onClick={onShowQuestion}
        disabled={isBusy || !gameSession || gameState === 'questionactive'}
        className={`${
          !gameSession || isBusy || gameState === 'questionactive' ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl`}
      >
        Show Question
      </button>

      <button
        onClick={onRevealAnswer}
        disabled={isBusy || !gameSession || gameState !== 'questionactive'}
        className={`${
          !gameSession || isBusy || gameState !== 'questionactive' ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
        } text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl`}
      >
        Reveal Answer
      </button>

      <button
        onClick={onShowLeaderboard}
        disabled={isBusy || !gameSession || gameState === 'leaderboard'}
        className={`${
          !gameSession || isBusy || gameState === 'leaderboard' ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'
        } text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl`}
      >
        Show Leaderboard
      </button>
    </div>
  );
}

export default AdminControls;