// src/hooks/usePlayerJoin.js
import { useState } from 'react';
// UPDATED: Import from new service
import { joinGame } from '../services/player/playerAuth';

export function usePlayerJoin(gameSession, currentUser, onJoinSuccess, handleMessage) {
  const [isJoining, setIsJoining] = useState(false);
  // handleMessage is passed in from the parent component

  const handleJoinGame = async (e, nickname) => {
    e.preventDefault();
    if (!nickname.trim()) {
      handleMessage('Please enter a nickname!', 'error', 2000);
      return;
    }

    if (!gameSession) {
      handleMessage('No active game! Ask the host to create one.', 'error');
      return;
    }

    if (!currentUser) {
      handleMessage('You must be logged in to join!', 'error');
      return;
    }

    setIsJoining(true);
    try {
      // UPDATED: Using new service
      const uid = await joinGame(gameSession.id, currentUser.uid, nickname.trim());
      localStorage.setItem('triviaPlayerId', uid);
      localStorage.setItem('triviaNickname', nickname.trim());
      localStorage.setItem('triviaGameId', gameSession.id);
      
      // Call the callback to update page state
      onJoinSuccess(uid, nickname.trim());
      
      handleMessage(`Welcome, ${nickname}!`, 'success');
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsJoining(false);
    }
  };

  // Only returns the state and handler, not the message state
  return { isJoining, handleJoinGame };
}