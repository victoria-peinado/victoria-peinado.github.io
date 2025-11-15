// src/components/stream/StreamWaitingView.jsx
import React from 'react';

// 1. We just need the gamePin to pass to the header now
function StreamWaitingView({ gamePin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="text-9xl mb-8"></div>
        <h1 className="text-7xl font-bold mb-6">Get Ready!</h1>
        <p className="text-3xl text-gray-300 mb-12">
          The next question is coming soon...
        </p>
        
        {/* 2. Remove the entire QR Code Placeholder and FIX comment */}
        
      </div>
    </div>
  );
}

export default StreamWaitingView;