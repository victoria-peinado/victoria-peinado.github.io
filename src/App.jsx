// src/App.jsx
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

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

export default function App() {
  return (
    <HashRouter>
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
          {/* UPDATED: /join is now in KioskLayout */}
          <Route path="/join" element={<PlayerPinEntry />} />
          
          {/* Redirect /play to /join */}
          <Route path="/play" element={<Navigate to="/join" replace />} />
          <Route path="/play/:gameId" element={<PlayerPage />} />
          <Route path="/stream/:gameId" element={<StreamPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}