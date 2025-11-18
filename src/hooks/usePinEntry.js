// src/hooks/usePinEntry.js
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { signInAnonymously } from '../services/authService'; // 1. Import the sign-in service

export function usePinEntry() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { gamePin } = useParams();
  
  const { currentUser, loading } = useAuth(); 

  // --- FIX: Trigger Anonymous Sign-In on this page ---
  useEffect(() => {
    const ensureAnonymousAuth = async () => {
      // If auth finished loading, and we still don't have a user...
      if (!loading && !currentUser) {
        try {
          // ...create the guest account immediately.
          await signInAnonymously();
        } catch (err) {
          console.error("Failed to sign in anonymously on join page:", err);
          setError("Could not initialize guest session. Please refresh.");
        }
      }
    };

    ensureAnonymousAuth();
  }, [loading, currentUser]);
  // --------------------------------------------------

  useEffect(() => {
    if (gamePin) {
      setPin(gamePin.toUpperCase());
    } else {
      const savedPin = sessionStorage.getItem('gamePin');
      if (savedPin) {
        setPin(savedPin.toUpperCase());
      }
    }
  }, [gamePin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;

    // Guard: Wait for the auto-sign-in (above) to complete
    if (loading || !currentUser) {
      setError('Guest authentication is not complete. Please wait a moment and try again.');
      setIsJoining(false);
      return;
    }
    
    setIsJoining(true);
    setError('');

    try {
      const pinUpper = pin.trim().toUpperCase();

      // This query requires the user to be signed in (handled by the rules we fixed)
      const pinQuery = query(
        collection(db, 'gameSessions'),
        where('gamePinUpper', '==', pinUpper)
      );

      const snapshot = await getDocs(pinQuery);

      if (snapshot.empty) {
        setError('Game not found. Please check the PIN and try again.');
        setIsJoining(false);
        return;
      }

      sessionStorage.removeItem('gamePin');

      const gameId = snapshot.docs[0].id;

      navigate(`/player/${gameId}`);
    } catch (err) {
      console.error('Error finding game:', err);
      setError('An error occurred. Please try again.');
      setIsJoining(false);
    }
  };

  const isWaitingForAuth = !currentUser || loading;

  return {
    pin,
    setPin,
    error,
    isJoining: isJoining || isWaitingForAuth, 
    handleSubmit,
  };
}