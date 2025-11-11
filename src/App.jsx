import React, { useState } from 'react';
import { auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import AdminPage from './AdminPage';
import StreamPage from './StreamPage';  // Add this import
import PlayerPage from './PlayerPage';  // Add this import
import { 
  HashRouter, 
  Routes, 
  Route, 
  Link, 
  useNavigate 
} from 'react-router-dom';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/play" element={<PlayerPage />} />  {/* Updated */}
        <Route path="/stream" element={<StreamPage />} />
      </Routes>
    </HashRouter>
  );
}
// --- 1. Landing Page (Feature cards removed) ---
function LandingPage() {
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleJoinGame = () => {
    if (nickname.trim()) {
      // Navigate to player page - they'll join there
      navigate('/play');
    } else {
      setMessage({ text: 'Please enter a nickname to join!', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4">
      {/* Header with Navigation */}
      <header className="w-full max-w-5xl py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-400">Live Trivia Night</h1>
        
        {/* Prettier Navigation Buttons */}
        <nav className="flex gap-3">
          <Link 
            to="/admin" 
            className="group relative px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            <span className="flex items-center gap-2">
               <span>Admin</span>
            </span>
          </Link>
          
          <Link 
            to="/play" 
            className="group relative px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            <span className="flex items-center gap-2">
               <span>Play</span>
            </span>
          </Link>
          
          <Link 
            to="/stream" 
            className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            <span className="flex items-center gap-2">
               <span>Stream</span>
            </span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
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
              onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
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
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-8 mt-16 text-center text-gray-500">
        <p>&copy; 2025 Trivia App. All rights reserved.</p>
      </footer>
    </div>
  );
}
