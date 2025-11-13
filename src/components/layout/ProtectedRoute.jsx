// src/components/layout/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

export default function ProtectedRoute({ children }) {
  const { currentUser, isAdmin, loading } = useAuth(); // <-- NEW: Get isAdmin state

  if (loading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  if (!currentUser) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // User is logged in BUT NOT an admin, redirect to home
    console.warn("Access denied: User is not an admin.");
    return <Navigate to="/" replace />;
  }

  // User is logged in AND is an admin
  return children;
}