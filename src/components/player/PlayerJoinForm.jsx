// src/components/player/PlayerJoinForm.jsx
import React from 'react';

function PlayerJoinForm({
  nickname,
  setNickname,
  handleJoinGame,
  isJoining,
  gameLoading,
  gameSession,
  message,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-blue-900 text-white p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div className="text-center mb-8">
            <div className="text-7xl mb-4"></div>
            <h1 className="text-4xl font-bold mb-2">Join the Game!</h1>
            <p className="text-gray-300">Enter your nickname to play</p>
          </div>

          {/* Show loading spinner while game session is loading */}
          {gameLoading && (
            <div className="text-center p-4">
              <p className="text-lg animate-pulse">Connecting to game...</p>
            </div>
          )}

          {!gameLoading && (
            <>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                placeholder="Your Nickname"
                className="w-full p-4 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-xl"
                maxLength={20}
                disabled={isJoining}
              />

              <button
                onClick={handleJoinGame}
                disabled={isJoining || gameLoading || !gameSession}
                className={`w-full font-bold p-4 rounded-lg shadow-lg transition-all text-xl ${
                  isJoining || gameLoading || !gameSession
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                }`}
              >
                {isJoining ? 'Joining...' : 'Join Game'}
              </button>
            </>
          )}

          {message.text && (
            <div className={`mt-4 p-3 rounded-lg text-center ${
              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {message.text}
            </div>
          )}

          {!gameSession && !gameLoading && (
            <div className="mt-6 p-4 bg-yellow-900 border border-yellow-600 rounded-lg text-center">
              <p className="text-sm">No active game right now</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerJoinForm;