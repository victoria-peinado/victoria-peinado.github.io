// src/components/admin/GameStatus.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link

function GameStatus({ gameSession, loading }) {
  // Add a "Stream Link"
  const streamUrl = `/#/stream/${gameSession?.id}`;

  return (
    <div className="mt-8 p-4 bg-gray-700 rounded-lg border border-gray-600">
      <h3 className="text-xl font-semibold mb-2">Current Game Status</h3>
      {loading ? (
        <p className="text-gray-300">Loading...</p>
      ) : gameSession ? (
        <>
          <p className="text-gray-300">
            Game State: <span className="text-green-400 font-bold uppercase">{gameSession.state}</span>
          </p>
          <p className="text-gray-300">
            Current Question: <span className="text-blue-400 font-bold">{gameSession.currentQuestionIndex + 1}</span>
          </p>
          {/* FIX: Removed the redundant Game ID from this component.
            The Game PIN is already shown in the page header.
          */}
          <div className="mt-4">
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Open Stream Link 
            </a>
          </div>
        </>
      ) : (
        <p className="text-gray-400">No active game</p>
      )}
    </div>
  );
}

export default GameStatus;