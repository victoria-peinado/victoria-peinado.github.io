// src/hooks/usePlayerAuth.js
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signInAnonymously } from '../services/authService';

export function usePlayerAuth(gameId, currentUser, authLoading) {
  const location = useLocation();
  const navigate = useNavigate();
  const [playerId, setPlayerId] = useState(null);
  const [nickname, setNickname] = useState(location.state?.nickname || '');
  const [isVerifying, setIsVerifying] = useState(true);

  const checkExistingPlayer = useCallback(
    async (uid) => {
      setIsVerifying(true);
      const savedPlayerId = localStorage.getItem('triviaPlayerId');
      const savedGameId = localStorage.getItem('triviaGameId');
      const savedNickname = localStorage.getItem('triviaNickname');

      if (savedGameId !== gameId) {
        localStorage.removeItem('triviaPlayerId');
        localStorage.removeItem('triviaNickname');
        localStorage.removeItem('triviaGameId');
        setIsVerifying(false);
        return;
      }

      if (savedPlayerId === uid && savedGameId === gameId && savedNickname) {
        try {
          const playerRef = doc(
            db,
            `gameSessions/${gameId}/players/${savedPlayerId}`
          );
          const playerSnap = await getDoc(playerRef);

          if (playerSnap.exists()) {
            const playerData = playerSnap.data();
            if (playerData.hasExited === true) {
              localStorage.removeItem('triviaPlayerId');
              localStorage.removeItem('triviaNickname');
              localStorage.removeItem('triviaGameId');
              setPlayerId(null);
            } else if (playerData.isKicked === true) {
              localStorage.removeItem('triviaPlayerId');
              localStorage.removeItem('triviaNickname');
              localStorage.removeItem('triviaGameId');
              setPlayerId(null);
              navigate('/', { state: { message: 'You were kicked from this game.' } });
            } else {
              setPlayerId(savedPlayerId);
              setNickname(savedNickname);
            }
          } else {
            localStorage.removeItem('triviaPlayerId');
            localStorage.removeItem('triviaNickname');
            localStorage.removeItem('triviaGameId');
          }
        } catch (error) {
          console.error('Error verifying player:', error);
        }
      }
      setIsVerifying(false);
    },
    [gameId, navigate, setNickname, setPlayerId]
  );

  useEffect(() => {
    const verifyOrSignIn = async () => {
      if (authLoading) {
        setIsVerifying(true);
        return;
      }

      if (currentUser) {
        // User is logged in (registered OR anonymous)
        await checkExistingPlayer(currentUser.uid);
      } else {
        // No user is logged in. Sign them in anonymously.
        setIsVerifying(true);
        try {
          // FIX: Add a brief timeout to allow the Firebase connection to stabilize
          // and prevent rapid, repeated sign-in attempts on fast renders.
          await new Promise(resolve => setTimeout(resolve, 150)); 
          await signInAnonymously();
          // The hook will now re-run when onAuthStateChanged fires.
        } catch (error) {
          console.error('Failed to sign in anonymously:', error);
          setIsVerifying(false);
        }
      }
    };

    verifyOrSignIn();
  }, [currentUser, authLoading, gameId, checkExistingPlayer]);

  return { playerId, setPlayerId, nickname, setNickname, isVerifying };
}