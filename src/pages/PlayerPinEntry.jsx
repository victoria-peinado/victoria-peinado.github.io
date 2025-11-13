// src/pages/PlayerPinEntry.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function PlayerPinEntry() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setIsJoining(true);
    setError('');

    try {
      const pinUpper = pin.trim().toUpperCase();

      // Query against the 'gamePinUpper' field (removed state filter to allow joining at any time)
      const pinQuery = query(
        collection(db, 'gameSessions'),
        where('gamePinUpper', '==', pinUpper)
      );

      const snapshot = await getDocs(pinQuery);

      if (snapshot.empty) {
        setError('Game not found. Please check the PIN and try again.');
        setIsJoining(false);
        return;
      }

      // Game found, navigate to play page
      const gameId = snapshot.docs[0].id;
      navigate(`/play/${gameId}`);
    } catch (err) {
      console.error("Error finding game:", err);
      setError('An error occurred. Please try again.');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Join Game
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter the 5-character game PIN
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value.toUpperCase())}
            placeholder="Enter PIN"
            maxLength={5}
            className="w-full px-4 py-3 text-2xl text-center uppercase border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            disabled={isJoining}
          />

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isJoining || pin.trim().length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  );
}