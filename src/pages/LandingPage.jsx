// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  // The local state for nickname and join is removed
  // as players now join via a Game PIN on the player page.

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4">
      <header className="w-full max-w-5xl py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-400">Live Trivia Night</h1>
        
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

      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-5xl text-center px-4">
        <div className="bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4">
            The Game is On!
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get a Game PIN from the host and click 'Play' to join the game.
          </p>{/* <-- FIX: Removed the stray </all-files-data-was-updated-successfully> text */}
          
          {/* This form is removed. The "Play" button in the nav is now the primary action. */}
          <Link 
            to="/play" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-2xl"
          >
            Click Here to Enter Game PIN
          </Link>

        </div>
      </main>

      <footer className="w-full max-w-5xl py-8 mt-16 text-center text-gray-500">
        <p>&copy; 2025 Trivia App. All rights reserved.</p>
      </footer>
    </div>
  );
}