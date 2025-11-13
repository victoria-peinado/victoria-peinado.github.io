// src/components/common/LoadingScreen.jsx
import React from 'react';

function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 text-white p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-pulse"></div>
        <h1 className="text-4xl font-bold">{message}</h1>
      </div>
    </div>
  );
}

export default LoadingScreen;