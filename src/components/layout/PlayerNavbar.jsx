// src/components/layout/PlayerNavbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../services/authService';
import { handleExitGame } from '../../services/playerService';
import ConfirmModal from '../common/ConfirmModal';

export default function PlayerNavbar() {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isBackModalOpen, setIsBackModalOpen] = useState(false); // <-- NEW state for "Back" button
  
  const navigate = useNavigate();
  const { gameId } = useParams(); 
  const { currentUser } = useAuth();
  
  const showExitGameButton = !!gameId;
  const showLogoutButton = !!currentUser;

  // --- Handlers ---

  const onConfirmExit = async () => {
    if (gameId && currentUser) {
      await handleExitGame(gameId, currentUser.uid);
    }
    setIsExitModalOpen(false);
    navigate('/'); // Navigate to Landing Page after exiting
  };
  
  // NEW: Handler for the "Back to Home" modal
  const onConfirmBackToHome = async () => {
    if (gameId && currentUser) {
      await handleExitGame(gameId, currentUser.uid);
    }
    setIsBackModalOpen(false);
    navigate('/'); // Navigate to Landing Page after exiting
  };

  const onConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    
    if (gameId && currentUser) {
      await handleExitGame(gameId, currentUser.uid);
    }
    
    try {
      await logout();
      navigate('/login'); 
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <>
      <nav className="w-full bg-transparent p-4 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* --- FIX IS HERE --- */}
          {/* "Back to Home" is now conditional */}
          {gameId ? (
            // If in a game, it's a button that opens a modal
            <button
              onClick={() => setIsBackModalOpen(true)}
              className="px-4 py-2 text-white bg-gray-700 bg-opacity-50 rounded-lg hover:bg-gray-600 transition"
            >
              Back to Home
            </button>
          ) : (
            // If not in a game (e.g., /join), it's a simple link
            <Link 
              to="/" 
              className="px-4 py-2 text-white bg-gray-700 bg-opacity-50 rounded-lg hover:bg-gray-600 transition"
            >
              Back to Home
            </Link>
          )}
          {/* --- END FIX --- */}

          <div className="flex gap-4">
            {showExitGameButton && (
              <button
                onClick={() => setIsExitModalOpen(true)}
                className="px-4 py-2 text-white bg-red-600 bg-opacity-80 rounded-lg hover:bg-red-700 transition"
              >
                Exit Game
              </button>
            )}

            {showLogoutButton && (
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="px-4 py-2 text-white bg-gray-600 bg-opacity-80 rounded-lg hover:bg-gray-700 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- Modals --- */}
      
      {/* NEW: Modal for the "Back to Home" button */}
      <ConfirmModal
        isOpen={isBackModalOpen}
        onClose={() => setIsBackModalOpen(false)}
        onConfirm={onConfirmBackToHome}
        title="Go Home?"
        message="This will exit you from the current game. Your score will be saved, but you won't be able to rejoin."
        confirmText="Exit Game"
        confirmVariant="danger"
      />
      
      <ConfirmModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onConfirmExit}
        title="Exit Game?"
        message="Are you sure you want to exit the game? Your score will be saved, but you won't be able to rejoin."
        confirmText="Exit Game"
        confirmVariant="danger"
      />
      
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={onConfirmLogout}
        title="Log Out?"
        message={
          gameId 
            ? "This will log you out AND exit you from the current game. Are you sure?"
            : "Are you sure you want to log out?"
        }
        confirmText="Log Out"
        confirmVariant="danger"
      />
    </>
  );
}