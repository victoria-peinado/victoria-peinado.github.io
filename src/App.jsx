// src/App.jsx
import React, { useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useAudio } from './hooks/useAudio';
import WelcomeModal from './components/common/WelcomeModal';

// Layout Imports are NOT lazy-loaded
import ProtectedRoute from './components/layout/ProtectedRoute'; // For Admins
import LoggedInRoute from './components/layout/LoggedInRoute'; // For All Logged-In Users
import MainLayout from './components/layout/MainLayout';
import KioskLayout from './components/layout/KioskLayout';
import AdminLayout from './components/layout/AdminLayout';

// Import the fallback components
import LoadingScreen from './components/common/LoadingScreen';
import ErrorScreen from './components/common/ErrorScreen';

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
const AdminQuestionBankEdit = lazy(
  () => import('./pages/AdminQuestionBankEdit')
);
const PlayerProfile = lazy(() => import('./pages/PlayerProfile'));

// ... (AppInitializer is unchanged) ...
function AppInitializer({ children }) {
  useEffect(() => {
    // This logic is for the old ?pin= query param, which is fine to keep
    // as a fallback for old links.
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
      <WelcomeModal isOpen={!isUnlocked} onConfirm={handleWelcomeConfirm} />

      <ErrorBoundary FallbackComponent={ErrorScreen}>
        <HashRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Routes WITH Main Navbar (Login, Admin, etc.) */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* --- THIS IS THE SPRINT 16 CHANGE --- */}
                {/* 1. The route is now /join and can accept an optional :gamePin */}
                <Route path="/join/:gamePin?" element={<PlayerPinEntry />} />
                {/* 2. It is now inside MainLayout, so it has the site navbar */}
                {/* --- END SPRINT 16 CHANGE --- */}

                <Route element={<LoggedInRoute />}>
                  <Route path="/profile" element={<PlayerProfile />} />
                </Route>
              </Route>

              {/* Protected Admin Routes - Uses the ADMIN-ONLY guard */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/game/:gameId" element={<AdminGame />} />
                  <Route
                    path="/admin/question-banks"
                    element={<AdminQuestionBanks />}
                  />
                  <Route
                    path="/admin/question-banks/:bankId"
                    element={<AdminQuestionBankEdit />}
                  BY_LINE_NUMBER
                  />
                </Route>
              </Route>

              {/* Routes WITHOUT Main Navbar (Player/Stream Kiosk Mode) */}
              <Route element={<KioskLayout />}>
                {/* PlayerPinEntry was moved to MainLayout */}
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