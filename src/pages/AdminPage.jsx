// src/pages/AdminPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Import our new services and components
import * as gameService from '../services/gameService';
import AdminControls from '../components/admin/AdminControls';
import GameStatus from '../components/admin/GameStatus';

function AdminPage() {
  // 'isBusy' now handles all loading states, not just creating
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { gameSession, loading: gameLoading } = useActiveGameSession();

  const handleMessage = (text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  // The new handlers are thin wrappers. They handle UI state
  // and call the service for the actual logic.

  const handleCreateNewGame = async () => {
    setIsBusy(true);
    handleMessage('Creating new game...', 'info');
    try {
      const gameSessionId = await gameService.createNewGame();
      console.log("Game created successfully:", gameSessionId);
      handleMessage('Game created successfully!', 'success');
    } catch (error) {
      console.error(error);
      handleMessage(error.message, 'error');
    } finally {
      setIsBusy(false);
    }
  };

  const handleShowQuestion = async () => {
    setIsBusy(true);
    handleMessage('Showing question...', 'info', 2000);
    try {
      const newIndex = await gameService.showQuestion(gameSession);
      console.log("Question shown, index:", newIndex);
      handleMessage('Question is now live!', 'success', 2000);
    } catch (error) {
      console.error(error);
      handleMessage(error.message, 'error', 2000);
    } finally {
      setIsBusy(false);
    }
  };

  const handleRevealAnswer = async () => {
    setIsBusy(true);
    handleMessage('Calculating scores...', 'info');
    try {
      const scoredPlayers = await gameService.revealAnswer(gameSession);
      console.log(`Answer revealed for question ${gameSession.currentQuestionIndex}`);
      if (scoredPlayers > 0) {
        handleMessage(`Scores updated for ${scoredPlayers} players!`, 'success');
      } else {
        handleMessage('Answer revealed (no correct answers)', 'success');
      }
    } catch (error) {
      console.error(error);
      handleMessage(error.message, 'error');
    } finally {
      setIsBusy(false);
    }
  };

  const handleShowLeaderboard = async () => {
    setIsBusy(true);
    handleMessage('Showing leaderboard...', 'info', 2000);
    try {
      await gameService.showLeaderboard(gameSession);
      console.log("Leaderboard shown");
      handleMessage('Leaderboard is now visible!', 'success', 2000);
    } catch (error) {
      console.error(error);
      handleMessage(error.message, 'error', 2000);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-5xl font-bold text-center text-red-400 mb-4">
          Admin Control Panel
        </h1>
        <p className="text-center text-gray-300 text-lg">
          Your remote control for managing the live trivia game
        </p>
        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
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

      <main className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-center">Game Controls</h2>
          
          <AdminControls
            onCreateGame={handleCreateNewGame}
            onShowQuestion={handleShowQuestion}
            onRevealAnswer={handleRevealAnswer}
            onShowLeaderboard={handleShowLeaderboard}
            gameSession={gameSession}
            isBusy={isBusy || gameLoading}
          />
          
          <GameStatus gameSession={gameSession} loading={gameLoading} />

        </div>
      </main>
    </div>
  );
}

export default AdminPage;