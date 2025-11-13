import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGameSession } from '../hooks/useGameSession';
import { useQuestionBank } from '../hooks/useQuestionBank';
import * as gameService from '../services/gameService';
import AdminControls from '../components/admin/AdminControls';
import GameStatus from '../components/admin/GameStatus';
import LivePlayerList from '../components/admin/LivePlayerList';
import Timer from '../components/common/Timer';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';

export default function AdminGame() {
  const { gameId } = useParams();
  const { gameSession, loading: gameLoading, error } = useGameSession(gameId);
  const { questions, loading: questionsLoading } = useQuestionBank(gameSession?.questionBankId);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [autoRevealTriggered, setAutoRevealTriggered] = useState(false);

  const handleMessage = (text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  useEffect(() => {
    if (gameSession?.state === 'questionactive') {
      setAutoRevealTriggered(false);
    }
  }, [gameSession?.currentQuestionIndex, gameSession?.state]);

  const handleTimerExpire = async () => {
    if (autoRevealTriggered || isBusy) return;
    
    setAutoRevealTriggered(true);
    setIsBusy(true);
    handleMessage('Time\'s up! Calculating scores...', 'info');
    
    try {
      const scoredCount = await gameService.revealAnswer(gameSession.id, gameSession.currentQuestionIndex);
      handleMessage(`Scores calculated! ${scoredCount} players scored.`, 'success');
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsBusy(false);
    }
  };

  const handleShowQuestion = async () => {
    setIsBusy(true);
    handleMessage('Showing question...', 'info', 2000);
    try {
      await gameService.showQuestion(
        gameSession.id,
        gameSession.currentQuestionIndex,
        gameSession.state,
        questions // ADDED: Pass questions array
      );
      handleMessage('Question is now live!', 'success', 2000);
    } catch (error) {
      handleMessage(error.message, 'error', 2000);
    } finally {
      setIsBusy(false);
    }
  };

  const handleShowLeaderboard = async () => {
    setIsBusy(true);
    handleMessage('Showing leaderboard...', 'info', 2000);
    try {
      await gameService.showLeaderboard(gameSession.id);
      handleMessage('Leaderboard is now visible!', 'success', 2000);
    } catch (error) {
      handleMessage(error.message, 'error', 2000);
    } finally {
      setIsBusy(false);
    }
  };

  const handleEndGame = async () => {
    if (!confirm('Are you sure you want to end the game?')) {
      return;
    }

    setIsBusy(true);
    handleMessage('Ending game...', 'info');
    try {
      await gameService.endGame(gameSession.id);
      handleMessage('Game ended!', 'success');
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsBusy(false);
    }
  };

  if (gameLoading || questionsLoading) {
    return <LoadingScreen message="Loading game..." />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!gameSession) {
    return <ErrorScreen message="Game session not found." />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/admin" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-8">Game Control Panel</h1>

      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {message.text}
        </div>
      )}

      {/* Timer */}
      {gameSession.state === 'questionactive' && gameSession.questionStartTime && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Question Timer ({gameSession.questionDuration}s)
          </h2>
          <Timer
            startTime={gameSession.questionStartTime}
            duration={gameSession.questionDuration || 30}
            onExpire={handleTimerExpire}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminControls
          onShowQuestion={handleShowQuestion}
          onShowLeaderboard={handleShowLeaderboard}
          onEndGame={handleEndGame}
          gameSession={gameSession}
          isBusy={isBusy}
        />
        <GameStatus gameSession={gameSession} />
        <LivePlayerList gameId={gameId} />
      </div>
    </div>
  );
}