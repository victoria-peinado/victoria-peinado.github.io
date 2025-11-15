// src/App.jsx
import React, { useEffect } from 'react';
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
 * This runs ONCE on app load to check the main window URL.
 */
function PinUrlCatcher() {
  useEffect(() => {
    // 1. Check the *actual* browser URL search string (e.g., ?pin=m7qpN)
    const params = new URLSearchParams(window.location.search);
    const pin = params.get('pin');

    if (pin) {
      // 2. Found a PIN! Save it to session storage.
      sessionStorage.setItem('gamePin', pin);

      // 3. Clean the URL so it's not visible anymore.
      // We get the current hash path (e.g., '#/join')
      const hash = window.location.hash; 
      // We replace the browser history to remove the ?pin=...
      // The new URL will be just "https://magictrivia.org/#/join"
      window.history.replaceState(null, '', `/${hash}`);
    }
  }, []); // 4. Empty array means this runs only ONCE on initial app load

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