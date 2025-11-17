// src/App.jsx
import React, { useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary'; // 1. Import ErrorBoundary
import { useAudio } from './hooks/useAudio';
import WelcomeModal from './components/common/WelcomeModal';

// Layout Imports are NOT lazy-loaded
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import KioskLayout from './components/layout/KioskLayout';
import AdminLayout from './components/layout/AdminLayout';

// Import the fallback components
import LoadingScreen from './components/common/LoadingScreen';
import ErrorScreen from './components/common/ErrorScreen'; // 2. Import ErrorScreen

// --- Page Imports are now LAZY-LOADED ---
const LandingPage = lazy(() => import('./pages/LandingPage'));
const StreamPage = lazy(() => import('./pages/StreamPage'));
const PlayerPinEntry = lazy(() => import('./pages/PlayerPinEntry'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminGame = lazy(() => import('./pages/AdminGame'));
const AdminQuestionBanks = lazy(() => import('./pages/AdminQuestionBanks'));
const AdminQuestionBankEdit = lazy(() => import('./pages/AdminQuestionBankEdit'));

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
  const { isUnlocked, unlockAudio, setMusic } = useAudio();

  const handleWelcomeConfirm = () => {
    unlockAudio();
    setMusic('music_ambient.mp3');
  };

  return (
    <AppInitializer>
      <WelcomeModal
        isOpen={!isUnlocked}
        onConfirm={handleWelcomeConfirm}
      />

      {/* 3. Wrap HashRouter in the ErrorBoundary */}
      <ErrorBoundary FallbackComponent={ErrorScreen}>
        <HashRouter>
          {/* Wrap the Routes in Suspense to enable lazy loading */}
          <Suspense fallback={<LoadingScreen />}>
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
          </Suspense>
        </HashRouter>
      </ErrorBoundary>
    </AppInitializer>
  );
}