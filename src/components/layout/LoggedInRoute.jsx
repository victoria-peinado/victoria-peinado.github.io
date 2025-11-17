// src/components/layout/LoggedInRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

export default function LoggedInRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is logged in - render child routes (like /profile)
  return <Outlet />;
}