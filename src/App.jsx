// src/App.jsx
import React, { useEffect } from 'react';
// 1. Import useLocation to read the URL
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

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
 * 2. NEW HELPER COMPONENT
 * This component will live inside the Router and watch for a 'pin'
 * in the URL query string on ANY page.
 */
function PinUrlCatcher() {
  const location = useLocation();

  useEffect(() => {
    // Check for 'pin' in the URL
    const params = new URLSearchParams(location.search);
    const pin = params.get('pin');

    if (pin) {
      // 3. Found a PIN! Save it to session storage.
      sessionStorage.setItem('gamePin', pin);

      // 4. Clean the URL so it's not visible anymore.
      // We use window.history.replaceState to do this without a page reload.
      // We must include the '#' for the HashRouter.
      const cleanPath = location.pathname;
      window.history.replaceState(null, '', `#${cleanPath}`);
    }
  }, [location]); // This effect re-runs on every navigation

  return null; // This component renders nothing
}


export default function App() {
  return (
    <HashRouter>
      {/* 5. Add the PinUrlCatcher here */}
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
        </Route>
      </Routes>
    </HashRouter>
  );
}