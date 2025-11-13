// src/components/stream/StreamWaitingView.jsx
import React from 'react';

function StreamWaitingView({ gameSession }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="text-9xl mb-8">⏱</div>
        <h1 className="text-7xl font-bold mb-6">Get Ready!</h1>
        <p className="text-3xl text-gray-300 mb-12">
          The next question is coming soon...
        </p>
        
        {/* QR Code Placeholder */}
        <div className="bg-white p-8 rounded-2xl mx-auto w-64 h-64 flex items-center justify-center mb-8 shadow-lg">
          <div className="text-gray-800 text-center">
            <p className="text-sm font-bold mb-2">Scan to Join</p>
            {/* You can use a library like 'qrcode.react' here later */}
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xs">QR Code</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Or go to:<br/>
              {/* This should probably be a prop or config later */}
              magic-trivia.org
            </p>
          </div>
        </div>

        {/* FIX: Removed this section.
          The Game PIN is now handled by the persistent footer
          in the parent StreamPage.jsx component.
        */}
      </div>
    </div>
  );
}

export default StreamWaitingView;