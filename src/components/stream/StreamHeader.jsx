// src/components/stream/StreamHeader.jsx
import React from 'react';
import QRCode from 'react-qr-code';

function StreamHeader({ gamePin }) {
  // FIX: This now points to your homepage root, not /join
  const joinUrl = `https://magictrivia.org/?pin=${gamePin}`;

  return (
    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
      {/* Game PIN */}
      <div className="bg-black bg-opacity-70 rounded-lg p-6 shadow-lg">
        <div className="text-2xl text-gray-300 font-bold mb-2 uppercase tracking-widest">
          Game PIN
        </div>
        <div className="text-6xl text-white font-extrabold tracking-wider">
          {gamePin}
        </div>
      </div>

      {/* QR Code to Join */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCode
          value={joinUrl} // This will now be the correct URL
          size={160} 
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
        <p className="text-center text-black font-bold mt-2 text-sm">
          Scan to Join!
        </p>
      </div>
    </div>
  );
}

export default StreamHeader;