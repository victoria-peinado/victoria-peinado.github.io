// src/hooks/useAdminGame.js
import { useState, useEffect, useCallback } from 'react'; // 1. Import useCallback
import {
  showQuestion,
  revealAnswer,
  showLeaderboard,
  endGame,
} from '../services/game/gameState';

export function useAdminGame(gameSession, gameId, questions) {
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [autoRevealTriggered, setAutoRevealTriggered] = useState(false);

  // 2. Wrap handleMessage in useCallback
  const handleMessage = useCallback((text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  }, []); // Empty dependency array

  // Resets the auto-reveal trigger when a new question is shown
  useEffect(() => {
    if (gameSession?.state === 'questionactive') {
      setAutoRevealTriggered(false);
    }
  }, [gameSession?.currentQuestionIndex, gameSession?.state]);

  // 3. Wrap handleTimerExpire in useCallback
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
  // 4. Add all dependencies for the callback
  }, [autoRevealTriggered, isBusy, gameSession, handleMessage]);

  // 5. Wrap handleShowQuestion in useCallback
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
  // 6. Add all dependencies
  }, [gameSession, questions, handleMessage]);

  // 7. Wrap handleShowLeaderboard in useCallback
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
  // 8. Add all dependencies
  }, [gameSession, handleMessage]);

  // 9. Wrap handleEndGame in useCallback
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
  // 10. Add all dependencies
  }, [gameSession, handleMessage]);

  return {
    isBusy,
    message,
    handleMessage,
    handleTimerExpire,
    handleShowQuestion,
    handleShowLeaderboard,
    handleEndGame
  };
}