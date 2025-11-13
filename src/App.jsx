import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Import Layout Components
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout'; // <-- UPDATED
import KioskLayout from './components/layout/KioskLayout'; // <-- UPDATED

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
      {/* Routes are now wrapped in layouts */}
      <Routes>
        {/* Routes WITH Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/play" element={<PlayerPinEntry />} />
          <Route path="/play/:gameId" element={<PlayerPage />} />
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
            path="/admin/game/:gameId"
            element={
              <ProtectedRoute>
                <AdminGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <ProtectedRoute>
                <AdminQuestionBanks />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Routes WITHOUT Navbar (Kiosk Mode) */}
        <Route element={<KioskLayout />}>
          <Route path="/stream/:gameId" element={<StreamPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}