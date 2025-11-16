// src/hooks/usePlayerState.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function usePlayerState(gameId, playerId, gameSession) {
  const [adminMessage, setAdminMessage] = useState(null);
  const lastBroadcastTimestamp = useRef(null);
  const lastDirectMessageTimestamp = useRef(null);
  const navigate = useNavigate();

  // Listener for Direct Messages and Kicks
  useEffect(() => {
    if (!gameId || !playerId) return;

    const playerRef = doc(db, `gameSessions/${gameId}/players/${playerId}`);
    
    const unsubscribe = onSnapshot(playerRef, (doc) => {
      if (doc.exists()) {
        const playerData = doc.data();
        
        // --- KICK LOGIC ---
        if (playerData.isKicked === true) {
          console.log("Kicked by admin. Redirecting...");
          localStorage.removeItem('triviaPlayerId');
          localStorage.removeItem('triviaNickname');
          localStorage.removeItem('triviaGameId');
          navigate('/', { 
            state: { 
              message: "You have been kicked from the game by the admin." 
            } 
          });
          return;
        }
        
        // --- DIRECT MESSAGE LOGIC ---
        if (playerData.directMessage && playerData.directMessage.sentAt) {
          const newTimestamp = playerData.directMessage.sentAt?.seconds;
          if (newTimestamp > (lastDirectMessageTimestamp.current || 0)) {
            console.log("New direct message received");
            setAdminMessage({
              text: playerData.directMessage.message,
              type: 'direct'
            });
            lastDirectMessageTimestamp.current = newTimestamp;
          }
        }

      } else {
        console.log("Player document not found. Redirecting...");
        navigate('/', { 
          state: { 
            message: "The game session has ended." 
          } 
        });
      }
    }, (error) => {
      console.error("Error listening to player document:", error);
    });

    return () => unsubscribe();

  }, [gameId, playerId, navigate]);

  // Listener for Broadcasts
  useEffect(() => {
    if (gameSession && gameSession.broadcastMessage && gameSession.broadcastMessage.sentAt) {
      const newTimestamp = gameSession.broadcastMessage.sentAt?.seconds;
      
      if (newTimestamp > (lastBroadcastTimestamp.current || 0)) {
        console.log("New broadcast message received");
        setAdminMessage({
          text: gameSession.broadcastMessage.message,
          type: 'broadcast'
        });
        lastBroadcastTimestamp.current = newTimestamp;
      }
    }
  }, [gameSession]);

  return { adminMessage, setAdminMessage };
}