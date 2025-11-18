// src/hooks/useAuthForm.js
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // 1. Add useSearchParams
import { migrateAnonymousStats } from '../services/player/profileService'; // 2. Add new service

export function useAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // 3. Initialize searchParams

  // --- SPRINT 16: NEW FUNCTION ---
  /**
   * Called by the parent component (SignupPage) after a successful user creation.
   * Checks the URL for migration parameters and performs the stats transfer.
   * @param {object} user - The Firebase User object of the newly registered user.
   */
  const handlePostSignup = async (user) => {
    const gameId = searchParams.get('fromGame');
    const anonId = searchParams.get('anonId');

    if (gameId && anonId) {
      try {
        await migrateAnonymousStats(anonId, user.uid, gameId); // 4. Call new service [cite: 1152]
      } catch (error) {
        console.error('Anonymous stats migration failed:', error);
      }
    }
    // Always navigate to the profile after successful signup/migration
    navigate('/profile');
  };
  // --- END SPRINT 16 ---


  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    loading,
    setLoading,
    navigate,
    handlePostSignup // 5. Return the new function
  };
}