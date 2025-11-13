import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGameSession } from '../hooks/useGameSession';

import * as gameService from '../services/gameService';
import AdminControls from '../components/admin/AdminControls';
import GameStatus from '../components/admin/GameStatus';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';

export default function AdminGame() {
  const { gameId } = useParams();
  const { gameSession, loading: gameLoading, error } = useGameSession(gameId);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleMessage = (text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  // Thin wrappers, just like we planned
  const handleShowQuestion = async () => {
    setIsBusy(true);
    handleMessage('Showing question...', 'info', 2000);
    try {
      // FIX: Pass all required arguments, not just gameId
      const newIndex = await gameService.showQuestion(
        gameSession.id,
        gameSession.currentQuestionIndex,
        gameSession.state
      );
      handleMessage('Question is now live!', 'success', 2000);
    } catch (error) {
      handleMessage(error.message, 'error', 2000);
    } finally {
      setIsBusy(false);
    }
  };

  const handleRevealAnswer = async () => {
    setIsBusy(true);
    handleMessage('Calculating scores...', 'info');
    try {
      // FIX: Pass gameId and currentQuestionIndex, not the whole object
      const scoredPlayers = await gameService.revealAnswer(
        gameSession.id,
        gameSession.currentQuestionIndex
      );
      if (scoredPlayers > 0) {
        handleMessage(`Scores updated for ${scoredPlayers} players!`, 'success');
      } else {
        handleMessage('Answer revealed (no correct answers)', 'success');
      }
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsBusy(false);
    }
  };

  const handleShowLeaderboard = async () => {
    setIsBusy(true);
    handleMessage('Showing leaderboard...', 'info', 2000);
    try {
      // FIX: Pass gameSession.id (string) instead of gameSession (object)
      await gameService.showLeaderboard(gameSession.id);
      handleMessage('Leaderboard is now visible!', 'success', 2000);
    } catch (error) {
      handleMessage(error.message, 'error', 2000);
    } finally {
      setIsBusy(false);
    }
  };

  if (gameLoading) {
    return <LoadingScreen message="Loading game controls..." />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Game Control Panel</h1>
        <p className="text-2xl text-gray-400">Game ID: {gameId}</p>
        <div className="mt-4">
          <Link to="/admin" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Status Message */}
      {message.text && (
        <div className={`max-w-4xl mx-auto mb-4 p-4 rounded-lg text-center font-semibold ${
          message.type === 'success' ? 'bg-green-600' :
          message.type === 'error' ? 'bg-red-600' :
          'bg-blue-600'
        }`}>
          {message.text}
        </div>
      )}

      <main className="max-w-4xl">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-center">Game Controls</h2>
          
          <AdminControls
            onShowQuestion={handleShowQuestion}
            onRevealAnswer={handleRevealAnswer}
            onShowLeaderboard={handleShowLeaderboard}
            gameSession={gameSession}
            isBusy={isBusy || gameLoading}
          />
          
          <GameStatus gameSession={gameSession} loading={gameLoading} />

          {/* We will add LivePlayerList here later */}
        </div>
      </main>
    </div>
  );
}