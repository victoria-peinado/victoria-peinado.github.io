import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import AdminPage from './AdminPage';  // Import the new AdminPage

// --- Main App Component (Now the Router) ---
export default function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />  {/* Use new AdminPage */}
        <Route path="/play" element={<PlayerPage />} />
        <Route path="/stream" element={<StreamPage />} />
      </Routes>
    </HashRouter>
  );
}

// --- 1. Landing Page (Feature cards removed) ---
function LandingPage() {
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleJoinGame = () => {
    if (nickname.trim()) {
      setMessage({
        text: `Welcome, ${nickname}! Ready to play... (Routing logic will go here)`,
        type: 'success'
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } else {
      setMessage({ text: 'Please enter a nickname to join!', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4">
      <header className="w-full max-w-5xl py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-400">Live Trivia Night</h1>
        <nav className="flex gap-4">
          <Link to="/admin" className="text-gray-300 hover:text-white">
            Admin
          </Link>
          <Link to="/play" className="text-gray-300 hover:text-white">
            Play
          </Link>
          <Link to="/stream" className="text-gray-300 hover:text-white">
            Stream
          </Link>
        </nav>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-5xl text-center px-4">
        <div className="bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4">
            The Game is On!
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the live trivia game, compete against your friends, and climb the leaderboard. All you need is your phone!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="flex-grow p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Enter your nickname"
            />
            <button
              onClick={handleJoinGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105"
            >
              Join Game
            </button>
          </div>
          {message.text && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white font-semibold`}>
              {message.text}
            </div>
          )}
        </div>
        {/* Feature cards section removed */}
      </main>
      <footer className="w-full max-w-5xl py-8 mt-16 text-center text-gray-500">
        <p>&copy; 2025 Trivia App. All rights reserved.</p>
      </footer>
    </div>
  );
}

// --- 3. Player Page (Placeholder) ---
function PlayerPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center text-green-400 mb-8">
        Player View
      </h1>
      <p className="text-center text-lg text-gray-300">
        This is what the players will see on their phones.
      </p>
      <div className="mt-8 text-center">
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

// --- 4. Stream Page (Placeholder) ---
function StreamPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center text-purple-400 mb-8">
        Stream View
      </h1>
      <p className="text-center text-lg text-gray-300">
        This is what the audience will see (the OBS stream).
      </p>
      <div className="mt-8 text-center">
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}