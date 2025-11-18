// src/hooks/player/usePlayerSession.js
import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

// Import all the hooks PlayerPage used to import
import { useAuth } from '../../contexts/AuthContext';
import { usePlayerAuth } from '../usePlayerAuth';
import { usePlayerJoin } from '../usePlayerJoin';
import { usePlayerState } from '../usePlayerState';
import { usePlayerActions } from '../usePlayerActions';

/**
 * This is the new "assembler" hook for the player page.
 * It composes all the player-specific logic hooks into one.
 */
export function usePlayerSession(gameSession) {
  const { gameId } = useParams();
  const { currentUser, loading: authLoading } = useAuth(); // currentUser is available here!

  // 1. Message state (shared by all child hooks)
  const [message, setMessage] = useState({ text: '', type: '' });
  const handleMessage = useCallback((text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  }, []);

  // 2. Auth hook (verifies or gets existing player)
  const { playerId, setPlayerId, nickname, setNickname, isVerifying } =
    usePlayerAuth(gameId, currentUser, authLoading);

  // 3. Join hook (handles the join form)
  const { isJoining, handleJoinGame } = usePlayerJoin(
    gameSession,
    currentUser,
    (uid, joinedNickname) => {
      setPlayerId(uid);
      setNickname(joinedNickname);
    },
    handleMessage
  );

  // 4. State hook (listens for kicks/messages)
  const { adminMessage, setAdminMessage } = usePlayerState(
    gameId,
    playerId,
    gameSession
  );

  // 5. Actions hook (handles answer submissions)
  const { selectedAnswer, hasAnswered, isSubmitting, handleAnswerSubmit } =
    usePlayerActions(gameId, playerId, gameSession, handleMessage);

  // 6. Combine loading states
  const isLoading = authLoading || isVerifying;

  // 7. Return everything in a structured object
  return {
    isLoading,
    playerId,
    adminMessage,
    setAdminMessage,
    message,

    // Props for PlayerJoinForm
    joinForm: {
      nickname,
      setNickname,
      isJoining,
      handleJoinGame,
    },

    // Props for PlayerStateRenderer
    rendererProps: {
      nickname,
      onAnswerSelect: handleAnswerSubmit,
      hasAnswered,
      isSubmitting,
      selectedAnswer,
      // --- SPRINT 16: ADDED ---
      // Pass the anonymous flag (safely checking currentUser)
      isAnonymous: currentUser?.isAnonymous || false, 
      // Pass the current player ID
      playerId: playerId, 
      // --- END SPRINT 16 ---
    },
  };
}