// src/hooks/usePlayerJoin.js
import { useState } from 'react';
// UPDATED: Import from new service
import { joinGame } from '../services/player/playerAuth';

export function usePlayerJoin(
  gameSession,
  currentUser,
  onJoinSuccess,
  handleMessage
) {
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
      // This check is still valid, as usePlayerAuth ensures we have a
      // (potentially anonymous) user before this component is rendered.
      handleMessage('Still authenticating... Please try again in a moment.', 'error');
      return;
    }

    setIsJoining(true);
    try {
      // --- SPRINT 16: ADDED isAnonymous FLAG ---
      const uid = await joinGame(
        gameSession.id,
        currentUser.uid,
        nickname.trim(),
        currentUser.isAnonymous // Pass the anonymous status
      );
      // --- END SPRINT 16 ---

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