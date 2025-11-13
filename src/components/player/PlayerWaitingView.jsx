// src/components/player/PlayerWaitingView.jsx
import React from 'react';

function PlayerWaitingView() {
  const savedNickname = localStorage.getItem('triviaNickname');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 text-white p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl mb-8"></div>
        <h1 className="text-5xl font-bold mb-4">Get Ready, {savedNickname}!</h1>
        <p className="text-2xl text-gray-300">The next question is coming soon...</p>
      </div>
    </div>
  );
}

export default PlayerWaitingView;