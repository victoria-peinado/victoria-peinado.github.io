// src/components/common/ErrorScreen.jsx
import React from 'react';

function ErrorScreen({ error = "An unknown error occurred." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6"></div>
        <h1 className="text-4xl font-bold text-red-400 mb-4">Error</h1>
        <p className="text-xl text-gray-300">{error.toString()}</p>
      </div>
    </div>
  );
}

export default ErrorScreen;