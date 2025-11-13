// src/components/layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../services/authService';

export default function Navbar() {
  const { currentUser, isAdmin } = useAuth(); // <-- NEW: Get isAdmin state
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="w-full bg-gray-800 p-4 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-400">
          Live Trivia Night
        </Link>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <span className="text-gray-300 hidden sm:block">
                Signed in as: {currentUser.email}
              </span>
              
              {/* NEW: Only show Dashboard link if user is an admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  My Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}