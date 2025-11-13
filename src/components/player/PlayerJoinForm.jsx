// src/components/player/PlayerJoinForm.jsx
import React from 'react';

function PlayerJoinForm({ 
  nickname, 
  onNicknameChange,  // Changed from setNickname
  onJoinGame,        // Changed from handleJoinGame
  isJoining 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Enter your nickname to play
      </h2>
      
      <form onSubmit={onJoinGame} className="space-y-4">
        <div>
          <input
            type="text"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            placeholder="Your Nickname"
            className="w-full px-4 py-3 border rounded text-lg"
            disabled={isJoining}
            maxLength={20}
            autoFocus
          />
        </div>
        
        <button
          type="submit"
          disabled={isJoining || !nickname.trim()}
          className="w-full bg-green-600 text-white px-6 py-3 rounded text-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isJoining ? 'Joining...' : 'Join Game'}
        </button>
      </form>
    </div>
  );
}

export default PlayerJoinForm;