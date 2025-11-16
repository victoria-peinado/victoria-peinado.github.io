// src/components/layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 
import { logout } from '../../services/authService';
import { Button } from '../ui/Button'; // 1. Import new Button
import { useTranslation } from 'react-i18next'; // 2. Import i18n

export default function Navbar() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // 3. Initialize i18n

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
    // 4. Use new "Primal Mana" theme for the navbar
    <nav className="w-full bg-neutral-900 p-4 shadow-lg border-b border-neutral-700">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        {/* 5. Update title and style */}
        <Link to="/" className="text-2xl font-display font-bold text-primary">
          Magic Trivia
        </Link>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              {/* 6. Update text color */}
              <span className="text-neutral-300 hidden sm:block">
                {currentUser.email}
              </span>

              {isAdmin && (
                // 7. Use new <Button> component
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
              {/* 8. Use new <Button> component */}
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