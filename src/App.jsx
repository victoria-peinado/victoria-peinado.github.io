// src/App.jsx
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAudio } from './hooks/useAudio'; // 1. Import useAudio
import WelcomeModal from './components/common/WelcomeModal'; // 2. Import WelcomeModal

// ... (Layout Imports are unchanged) ...
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import KioskLayout from './components/layout/KioskLayout';
import AdminLayout from './components/layout/AdminLayout';

// ... (Page Imports are unchanged) ...
import LandingPage from './pages/LandingPage';
import StreamPage from './pages/StreamPage';
import PlayerPinEntry from './pages/PlayerPinEntry';
import PlayerPage from './pages/PlayerPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminGame from './pages/AdminGame';
import AdminQuestionBanks from './pages/AdminQuestionBanks';
import AdminQuestionBankEdit from './pages/AdminQuestionBankEdit';

// ... (AppInitializer is unchanged) ...
function AppInitializer({ children }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pin = params.get('pin');
    
    if (pin) {
      sessionStorage.setItem('gamePin', pin);
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, []);
  
  return <>{children}</>;
}

export default function App() {
  // 3. Get the global audio unlock state and function
  const { isUnlocked, unlockAudio, setMusic } = useAudio();

  // 4. Create the confirm handler for the modal
  const handleWelcomeConfirm = () => {
    unlockAudio(); // This will set isUnlocked = true
    setMusic('music_ambient.mp3'); // Play ambient music
  };

  return (
    <AppInitializer>
      {/* 5. Render the global modal ON TOP of the app */}
      <WelcomeModal
        isOpen={!isUnlocked}
        onConfirm={handleWelcomeConfirm}
      />

      <HashRouter>
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
              <Route path="/admin/question-banks" element={<AdminQuestionBanks />} />
              <Route path="/admin/question-banks/:bankId" element={<AdminQuestionBankEdit />} />
            </Route>
          </Route>

          {/* Routes WITHOUT Main Navbar (Player/Stream Kiosk Mode) */}
          <Route element={<KioskLayout />}>
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