// src/components/layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Keep Link for the logo
import { useAuth } from '../../contexts/AuthContext'; 
import { logout } from '../../services/authService';

export default function Navbar() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate(); // <-- NEW: Get the navigate function

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // NEW: Handlers for navigation
  const goToLogin = () => navigate('/login');
  const goToSignup = () => navigate('/signup');
  const goToAdmin = () => navigate('/admin');

  return (
    <nav className="w-full bg-gray-800 p-4 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <Link to="/" className="text-2xl font-bold text-blue-400">
          Live Trivia Night
        </Link>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <span className="text-gray-300 hidden sm:block">
                {currentUser.email}
              </span>

              {isAdmin && (
                <button // <-- UPDATED
                  onClick={goToAdmin}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  My Dashboard
                </button>
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
              {/* UPDATED: Changed from <Link> to <button> */}
              <button
                onClick={goToLogin}
                className="px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition"
              >
                Login
              </button>
              <button
                onClick={goToSignup}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}