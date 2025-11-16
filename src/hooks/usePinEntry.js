// src/hooks/usePinEntry.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function usePinEntry() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  // This effect now runs once when the hook is used
  useEffect(() => {
    // Check session storage for a saved PIN
    const savedPin = sessionStorage.getItem('gamePin');
    
    if (savedPin) {
      setPin(savedPin.toUpperCase());
    }
  }, []); // Empty array means this runs only on mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setIsJoining(true);
    setError('');

    try {
      const pinUpper = pin.trim().toUpperCase();

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
      
      // SUCCESS: Clear the saved PIN so it's not used again
      sessionStorage.removeItem('gamePin');

      const gameId = snapshot.docs[0].id;
      
      // --- THIS IS THE FIX ---
      // The route is /player/:gameId, not /play/:gameId
      navigate(`/player/${gameId}`); 

    } catch (err) {
      console.error("Error finding game:", err);
      setError('An error occurred. Please try again.');
      setIsJoining(false);
    }
  };

  return {
    pin,
    setPin,
    error,
    isJoining,
    handleSubmit
  };
}