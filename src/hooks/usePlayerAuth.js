// src/hooks/usePlayerAuth.js
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export function usePlayerAuth(gameId, currentUser, authLoading) {
  const location = useLocation();
  const navigate = useNavigate();
  const [playerId, setPlayerId] = useState(null);
  // Get initial nickname from location state OR empty
  const [nickname, setNickname] = useState(location.state?.nickname || '');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!currentUser) {
      // Auth is loaded, but no user
      setIsVerifying(false);
      return;
    }

    const checkExistingPlayer = async () => {
      const savedPlayerId = localStorage.getItem('triviaPlayerId');
      const savedGameId = localStorage.getItem('triviaGameId');
      const savedNickname = localStorage.getItem('triviaNickname');

      if (savedGameId !== gameId) {
        // Different game, clear old data and stop
        localStorage.removeItem('triviaPlayerId');
        localStorage.removeItem('triviaNickname');
        localStorage.removeItem('triviaGameId');
        setIsVerifying(false);
        return;
      }

      if (savedPlayerId === currentUser.uid && savedGameId === gameId && savedNickname) {
        try {
          const playerRef = doc(db, `gameSessions/${gameId}/players/${savedPlayerId}`);
          const playerSnap = await getDoc(playerRef);
          
          if (playerSnap.exists()) {
            const playerData = playerSnap.data();
            if (playerData.hasExited === true) {
              // Player has exited, block rejoin
              localStorage.removeItem('triviaPlayerId');
              localStorage.removeItem('triviaNickname');
              localStorage.removeItem('triviaGameId');
              setPlayerId(null);
            } else if (playerData.isKicked === true) {
              // Player was kicked
              localStorage.removeItem('triviaPlayerId');
              localStorage.removeItem('triviaNickname');
              localStorage.removeItem('triviaGameId');
              setPlayerId(null);
              navigate('/', { state: { message: "You were kicked from this game." } });
            } else {
              // Valid, existing player
              setPlayerId(savedPlayerId);
              setNickname(savedNickname); // Overwrite location state with saved nickname
            }
          } else {
            // Player doc doesn't exist, clear storage
            localStorage.removeItem('triviaPlayerId');
            localStorage.removeItem('triviaNickname');
            localStorage.removeItem('triviaGameId');
          }
        } catch (error) {
          console.error("Error verifying player:", error);
        }
      }
      setIsVerifying(false);
    };

    checkExistingPlayer();
  }, [currentUser, authLoading, gameId, navigate]);

  return { playerId, setPlayerId, nickname, setNickname, isVerifying };
}