// src/hooks/useAdminGame.js
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast'; // 1. Import toast
import {
  showQuestion,
  revealAnswer,
  showLeaderboard,
  endGame,
} from '../services/game/gameState';

export function useAdminGame(gameSession, gameId, questions) {
  const [isBusy, setIsBusy] = useState(false);
  // const [message, setMessage] = useState({ text: '', type: '' }); // 2. REMOVED message state
  const [autoRevealTriggered, setAutoRevealTriggered] = useState(false);

  // 3. UPDATED handleMessage to use toast
  const handleMessage = useCallback((text, type) => {
    if (type === 'error') {
      toast.error(text);
    } else if (type === 'info') {
      toast(text); // Use default toast for info
    } else {
      toast.success(text); // Default to success
    }
  }, []); // Empty dependency array

  // Resets the auto-reveal trigger when a new question is shown
  useEffect(() => {
    if (gameSession?.state === 'questionactive') {
      setAutoRevealTriggered(false);
    }
  }, [gameSession?.currentQuestionIndex, gameSession?.state]);

  const handleTimerExpire = useCallback(async () => {
    if (autoRevealTriggered || isBusy) return;
    
    setAutoRevealTriggered(true);
    setIsBusy(true);
    handleMessage('Time\'s up! Calculating scores...', 'info');
    
    try {
      const scoredCount = await revealAnswer(gameSession.id, gameSession.currentQuestionIndex);
      handleMessage(`Scores calculated! ${scoredCount} players scored.`, 'success');
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsBusy(false);
    }
  }, [autoRevealTriggered, isBusy, gameSession, handleMessage]);

  const handleShowQuestion = useCallback(async () => {
    setIsBusy(true);
    handleMessage('Showing question...', 'info', 2000);
    try {
      await showQuestion(
        gameSession.id,
        gameSession.currentQuestionIndex,
        gameSession.state,
        questions 
      );
      handleMessage('Question is now live!', 'success', 2000);
    } catch (error) {
      handleMessage(error.message, 'error', 2000);
    } finally {
      setIsBusy(false);
    }
  }, [gameSession, questions, handleMessage]);

  const handleShowLeaderboard = useCallback(async () => {
    setIsBusy(true);
    handleMessage('Showing leaderboard...', 'info', 2000);
    try {
      await showLeaderboard(gameSession.id);
      handleMessage('Leaderboard is now visible!', 'success', 2000);
    } catch (error) {
      handleMessage(error.message, 'error', 2000);
    } finally {
      setIsBusy(false);
    }
  }, [gameSession, handleMessage]);

  const handleEndGame = useCallback(async () => {
    if (!confirm('Are you sure you want to end the game?')) {
      return;
    }

    setIsBusy(true);
    handleMessage('Ending game...', 'info');
    try {
      await endGame(gameSession.id);
      handleMessage('Game ended!', 'success');
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsBusy(false);
    }
  }, [gameSession, handleMessage]);

  return {
    isBusy,
    // message, // 4. REMOVED message from return
    handleMessage, // Keep this, as BroadcastCard needs it
    handleTimerExpire,
    handleShowQuestion,
    handleShowLeaderboard,
    handleEndGame
  };
}