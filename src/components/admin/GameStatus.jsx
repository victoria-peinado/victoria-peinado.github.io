// src/components/admin/GameStatus.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

function GameStatus({ gameSession, loading }) {
  const streamUrl = `/#/stream/${gameSession?.id}`;

  // Helper function to format game state
  const getStateDisplay = (state) => {
    const stateMap = {
      'waiting': { text: 'Waiting', color: 'text-neutral-400' },
      'question': { text: 'Question', color: 'text-primary-light' },
      'questionactive': { text: 'Active', color: 'text-primary-light' },
      'answerrevealed': { text: 'Answer Revealed', color: 'text-secondary' },
      'leaderboard': { text: 'Leaderboard', color: 'text-primary' },
      'finished': { text: 'Finished', color: 'text-neutral-400' }
    };
    return stateMap[state] || { text: state, color: 'text-neutral-300' };
  };

  if (loading) {
    return <p className="text-neutral-400">Loading status...</p>;
  }

  if (!gameSession) {
    return <p className="text-neutral-400">No active game</p>;
  }

  const stateDisplay = getStateDisplay(gameSession.state);

  return (
    <div className="space-y-4">
      {/* Game State */}
      <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg border border-neutral-700">
        <span className="text-neutral-300 text-sm">Game State:</span>
        <span className={`font-bold uppercase text-sm ${stateDisplay.color}`}>
          {stateDisplay.text}
        </span>
      </div>

      {/* Current Question */}
      <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg border border-neutral-700">
        <span className="text-neutral-300 text-sm">Current Question:</span>
        <span className="font-bold text-primary-light">
          #{gameSession.currentQuestionIndex + 1}
        </span>
      </div>

      {/* Stream Link */}
      <div className="p-3 bg-neutral-800 rounded-lg border border-primary-dark">
        <p className="text-neutral-300 text-sm mb-2">Stream View:</p>
        <a
          href={streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-light hover:text-primary font-semibold text-sm underline"
        >
          Open Stream Link →
        </a>
      </div>
    </div>
  );
}

export default GameStatus;