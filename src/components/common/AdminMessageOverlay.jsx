// src/components/common/AdminMessageOverlay.jsx
import React from 'react';

export default function AdminMessageOverlay({ message, onClose }) {
  if (!message) return null;

  const isBroadcast = message.type === 'broadcast';
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white text-gray-900 w-full max-w-md p-6 rounded-2xl shadow-2xl border-4 border-purple-500 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold mb-4">
          {isBroadcast ? 'Broadcast from Admin' : 'Direct Message'}
        </h2>
        <p className="text-gray-700 text-lg mb-6">{message.text}</p>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}