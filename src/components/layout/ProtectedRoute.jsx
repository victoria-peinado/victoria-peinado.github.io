// src/components/layout/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

export default function ProtectedRoute() {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
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

  // User is logged in AND is an admin - render child routes
  return <Outlet />;
}