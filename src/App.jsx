// src/App.jsx
import React, { useEffect } from 'react';
// 1. Import useLocation and useNavigate
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Import Layout Components
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import KioskLayout from './components/layout/KioskLayout';

// Import all our pages
import LandingPage from './pages/LandingPage';
import StreamPage from './pages/StreamPage';
import PlayerPinEntry from './pages/PlayerPinEntry';
import PlayerPage from './pages/PlayerPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Import NEW Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminGame from './pages/AdminGame';
import AdminQuestionBanks from './pages/AdminQuestionBanks';

/**
 * 2. UPDATED HELPER COMPONENT
 * This now uses useNavigate for a more reliable URL clean-up.
 */
function PinUrlCatcher() {
  const location = useLocation();
  const navigate = useNavigate(); // 3. Get navigate function

  useEffect(() => {
    // This `location.search` will now correctly read from the hash
    const params = new URLSearchParams(location.search);
    const pin = params.get('pin');

    if (pin) {
      // 4. Found a PIN! Save it to session storage.
      sessionStorage.setItem('gamePin', pin);

      // 5. Use navigate to clean the URL (removes the ?pin=... part)
      // This replaces the history entry without a page reload.
      navigate(location.pathname, { replace: true }); 
    }
  }, [location, navigate]); // 6. Add navigate to dependency array

  return null; // This component renders nothing
}


export default function App() {
  return (
    <HashRouter>
      {/* 7. The PinUrlCatcher stays here */}
      <PinUrlCatcher />

      <Routes>
        {/* Routes WITH Main Navbar (Login, Admin, etc.) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/banks"
            element={
              <ProtectedRoute>
                <AdminQuestionBanks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/game/:gameId"
            element={
              <ProtectedRoute>
                <AdminGame />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Routes WITHOUT Main Navbar (Player/Stream Kiosk Mode) */}
        <Route element={<KioskLayout />}>
          {/* This page will now check sessionStorage for the PIN */}
          <Route path="/join" element={<PlayerPinEntry />} />
          
          <Route path="/play" element={<Navigate to="/join" replace />} />
          <Route path="/play/:gameId" element={<PlayerPage />} />
          <Route path="/stream/:gameId" element={<StreamPage />} />
        </Route> {/* <-- 8. FIXED TYPO HERE */}
      </Routes>
    </HashRouter>
  );
}