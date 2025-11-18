// src/components/stream/StreamHeader.jsx
import React from 'react';
import QRCode from 'react-qr-code';
import { useTranslation } from 'react-i18next';

function StreamHeader({ gamePin }) {
  const { t } = useTranslation();

  // --- SPRINT 16 FIX: Use window.location.origin ---
  // Gets the base URL (e.g., https://magictrivia.org or http://localhost:3000)
  const baseUri = window.location.origin;
  // The full URL uses the base, the hash (#), and the new /join/ route
  const joinUrl = `${baseUri}/#/join/${gamePin}`;
  // --- END SPRINT 16 FIX ---

  return (
    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
      <div
        className="bg-neutral-800 bg-opacity-80 rounded-lg p-6 shadow-lg 
                      border-2 border-neutral-700"
      >
        <div className="text-2xl text-neutral-100 font-bold mb-2 uppercase tracking-widest">
          {t('gamePin')}
        </div>
        <div className="text-6xl text-primary-light font-display font-extrabold tracking-wider">
          {gamePin}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCode
          value={joinUrl}
          size={160}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
        <p className="text-center text-black font-bold mt-2 text-sm">
          {t('stream.scanToJoin')}
        </p>
      </div>
    </div>
  );
}

export default StreamHeader;