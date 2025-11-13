// src/pages/PlayerPinEntry.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase'; // <-- UPDATED
import { collection, query, where, getDocs } from 'firebase/firestore'; // <-- UPDATED

export default function PlayerPinEntry() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(''); // <-- UPDATED
  const [isJoining, setIsJoining] = useState(false); // <-- UPDATED
  const navigate = useNavigate();

  const handleSubmit = async (e) => { // <-- UPDATED
    e.preventDefault();
    if (!pin.trim()) return;

    setIsJoining(true);
    setError('');

    try {
      // UPDATED: Query against the 'gamePinUpper' field
      const pinQuery = query(
        collection(db, 'gameSessions'),
        where('gamePinUpper', '==', pin.trim().toUpperCase()), // <-- Use new lookup field
        where('state', '==', 'waiting')
      );

      const snapshot = await getDocs(pinQuery);

      if (snapshot.empty) {
        setError('Game not found or is not accepting players.');
        setIsJoining(false);
        return;
      }

      // Game found, get the full gameId and navigate
      const gameId = snapshot.docs[0].id;
      navigate(`/play/${gameId}`);

    } catch (err) {
      console.error("Error finding game:", err);
      setError('An error occurred. Please try again.');
      setIsJoining(false); // <-- FIX: Added missing parenthesis
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <h2 className="text-4xl font-extrabold text-center mb-6 text-white">
          Enter Game PIN
        </h2>
        {/* UPDATED: Show error message */}
        {error && <p className="bg-red-600 text-white p-3 rounded-lg text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 sr-only" htmlFor="pin">
              Game PIN
            </label>
            <input
              type="text"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="ENTER PIN"
              required
              className="w-full p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
            />
          </div>
          <button
            type="submit"
            disabled={isJoining} // <-- UPDATED
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105"
          >
            {isJoining ? 'Finding Game...' : 'Join Game'} {/* <-- UPDATED */}
          </button>
        </form>
      </div>
    </div>
  );
}