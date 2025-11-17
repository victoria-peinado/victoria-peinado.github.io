// src/components/layout/AdminSidebar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../services/authService';
import { Button } from '../ui/Button'; // Import our new Button

export default function AdminSidebar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className="block px-4 py-3 rounded-lg text-neutral-100 
                 hover:bg-neutral-700 transition-colors"
    >
      {children}
    </Link>
  );

  return (
    <div className="w-64 bg-neutral-800 h-screen p-4 flex flex-col 
                    border-r border-neutral-700">
      {/* Logo/Title */}
      <h1 className="font-display text-2xl font-bold text-primary mb-6 px-2">
        Magic Trivia
      </h1>

      {/* Main Navigation */}
      <nav className="flex-grow">
        <NavLink to="/admin">Dashboard</NavLink>
        <NavLink to="/admin/question-banks">Question Banks</NavLink>
        {/* --- NEW: Added Profile Link --- */}
        <NavLink to="/profile">My Profile</NavLink>
        <NavLink to="/">View Site</NavLink>
      </nav>

      {/* Footer / User Area */}
      <div>
        {currentUser && (
          <span className="block text-sm text-neutral-300 px-4 py-2 truncate">
            {currentUser.email}
          </span>
        )}
        <Button
          variant="danger"
          onClick={handleLogout}
          className="text-base py-2" // Smaller text
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}