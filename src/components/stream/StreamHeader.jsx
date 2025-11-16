// src/components/stream/StreamHeader.jsx
import React from 'react';
import QRCode from 'react-qr-code';
import { useTranslation } from 'react-i18next'; // 1. Import

function StreamHeader({ gamePin }) {
  const { t } = useTranslation(); // 2. Initialize
  const joinUrl = `https://magictrivia.org/?pin=${gamePin}`;

  return (
    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
      
      {/* 3. Game PIN with new theme */}
      <div className="bg-neutral-800 bg-opacity-80 rounded-lg p-6 shadow-lg 
                      border-2 border-neutral-700">
        <div className="text-2xl text-neutral-100 font-bold mb-2 uppercase tracking-widest">
          {t('gamePin')} {/* 4. Use i18n key */}
        </div>
        <div className="text-6xl text-primary-light font-display font-extrabold tracking-wider">
          {gamePin}
        </div>
      </div>

      {/* QR Code */}
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