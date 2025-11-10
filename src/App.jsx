import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';

// --- SVG Icons (re-using from LandingPage) ---
const ZapIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 text-blue-400"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 text-blue-400"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const TrophyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 text-blue-400"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V22"></path>
    <path d="M14 14.66V22"></path>
    <path d="M17.5 9.5 16 14.3l-1.5 4.5a2 2 0 0 1-3 0L10 14.3 8.5 9.5c.7-.3 1.5-.5 2.5-.5h3c1 0 1.8.2 2.5.5Z"></path>
  </svg>
);

// --- Main App Component (Now the Router) ---
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/play" element={<PlayerPage />} />
        <Route path="/stream" element={<StreamPage />} />
      </Routes>
    </HashRouter>
  );
}

// --- 1. Landing Page (Your original component) ---
function LandingPage() {
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleJoinGame = () => {
    if (nickname.trim()) {
      setMessage({
        text: `Welcome, ${nickname}! Ready to play... (Routing logic will go here)`,
        type: 'success'
      });
      // In a real app, you'd navigate to /play
      // window.location.hash = '#/play'; // This is one way to do it
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
        {/* Simple nav to see other pages during development */}
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
        <section className="w-full max-w-5xl mt-16 md:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ZapIcon />}
              title="Real-Time Action"
              description="Questions and answers happen live. No delays, just pure trivia speed!"
            />
            <FeatureCard
              icon={<UsersIcon />}
              title="Compete with Friends"
              description="See who's the fastest and smartest in your group. Bragging rights are on the line."
            />
            <FeatureCard
              icon={<TrophyIcon />}
              title="Live Leaderboard"
              description="Watch your name climb the ranks after every question. Can you make it to the top?"
            />
          </div>
        </section>
      </main>
      <footer className="w-full max-w-5xl py-8 mt-16 text-center text-gray-500">
        <p>&copy; 2025 Your Trivia App. All rights reserved.</p>
      </footer>
    </div>
  );
}

// --- Reusable Feature Card Component ---
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center md:items-start text-center md:text-left border border-gray-700">
      <div className="flex-shrink-0 mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

// --- 2. Admin Page (Placeholder) ---
function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center text-red-400 mb-8">
        Admin Control Panel
      </h1>
      <p className="text-center text-lg text-gray-300">
        This is where the admin controls will go.
      </p>
      <div className="mt-8 text-center">
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          &larr; Back to Home
        </Link>
      </div>
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