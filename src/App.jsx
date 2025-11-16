// src/App.jsx

import React, { useEffect } from 'react';
// 1. We ONLY need useLocation here for the App logic, not the initializer
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Layout Components
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import KioskLayout from './components/layout/KioskLayout';
import AdminLayout from './components/layout/AdminLayout'; // ← ADD THIS LINE

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
import AdminQuestionBankEdit from './pages/AdminQuestionBankEdit';

/**
 * 2. NEW AppInitializer COMPONENT
 * This component runs *before* the HashRouter to safely
 * capture the PIN and clean the URL.
 */
function AppInitializer({ children }) {
  // This useEffect runs only ONCE when the app first loads.
  useEffect(() => {
    // 3. Check the *browser's* URL for the pin
    const params = new URLSearchParams(window.location.search);
    const pin = params.get('pin');
    
    if (pin) {
      // 4. Found a PIN! Save it to session storage.
      sessionStorage.setItem('gamePin', pin);
      
      // 5. Clean the URL.
      // This replaces "https://magictrivia.org/?pin=..."
      // with "https://magictrivia.org/"
      // The HashRouter will then take over and add its "#/"
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, []); // Empty array ensures this runs only once on mount
  
  // 6. Now that the URL is clean, render the app (the HashRouter)
  return <>{children}</>;
}

export default function App() {
  return (
    // 7. Wrap the *entire app* in the new Initializer
    <AppInitializer>
      <HashRouter>
        {/* We no longer need the PinUrlCatcher inside here */}
        <Routes>
          {/* Routes WITH Main Navbar (Login, Admin, etc.) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* Protected Admin Routes - NOW WRAPPED IN AdminLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/game/:gameId" element={<AdminGame />} />
              {/* --- NEW ROUTE FOR STEP 4 --- */}
              <Route path="/admin/question-banks" element={<AdminQuestionBanks />} />
              <Route path="/admin/question-banks/:bankId" element={<AdminQuestionBankEdit />} />
            </Route>
          </Route>

          {/* Routes WITHOUT Main Navbar (Player/Stream Kiosk Mode) */}
          <Route element={<KioskLayout />}>
            {/* This page will now check sessionStorage for the PIN */}
            
            {/* --- THIS IS THE FIX --- */}
            <Route path="/play" element={<PlayerPinEntry />} />
            
            <Route path="/player/:gameId" element={<PlayerPage />} />
            <Route path="/stream/:gameId" element={<StreamPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppInitializer>
  );
}