// src/components/layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 
import { logout } from '../../services/authService';
import { Button } from '../ui/Button'; 
import { useTranslation } from 'react-i18next';
import VolumeControl from '../common/VolumeControl'; // 1. Import VolumeControl

export default function Navbar() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); 

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const goToLogin = () => navigate('/login');
  const goToSignup = () => navigate('/signup');
  const goToAdmin = () => navigate('/admin');

  return (
    <nav className="w-full bg-neutral-900 p-4 shadow-lg border-b border-neutral-700">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <Link to="/" className="text-2xl font-display font-bold text-primary">
          Magic Trivia
        </Link>

        <div className="flex items-center gap-4">
          <VolumeControl /> {/* 2. Add VolumeControl component here */}
          
          {currentUser ? (
            <>
              <span className="text-neutral-300 hidden sm:block">
                {currentUser.email}
              </span>

              {isAdmin && (
                <Button 
                  onClick={goToAdmin}
                  variant="primary"
                  className="py-2 px-4 text-sm"
                >
                  {t('admin.dashboard.title')}
                </Button>
              )}

              <Button
                onClick={handleLogout}
                variant="danger"
                className="py-2 px-4 text-sm"
              >
                {t('logout')}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={goToLogin}
                variant="neutral"
                className="py-2 px-4 text-sm"
              >
                {t('login')}
              </Button>
              <Button
                onClick={goToSignup}
                variant="primary"
                className="py-2 px-4 text-sm"
              >
                {t('signup')}
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}