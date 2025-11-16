// src/pages/AdminGame.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';

// --- CORE HOOKS ---
import { useGameSession } from '../hooks/useGameSession';
import { useQuestionBank } from '../hooks/useQuestionBank';

// --- NEW HOOK ---
import { useAdminGame } from '../hooks/useAdminGame';

// --- COMPONENTS ---
import AdminControls from '../components/admin/AdminControls';
import GameStatus from '../components/admin/GameStatus';
import LivePlayerList from '../components/admin/LivePlayerList';
import Timer from '../components/common/Timer';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';
import ShareGameCard from '../components/admin/ShareGameCard';
import BroadcastCard from '../components/admin/BroadcastCard';

// UI Kit
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function AdminGame() {
  const { gameId } = useParams();

  // Data fetching hooks
  const { gameSession, loading: gameLoading, error } = useGameSession(gameId);
  const { questions, loading: questionsLoading } = useQuestionBank(
    gameSession?.questionBankId
  );

  // Logic hook - all state and handlers
  const {
    isBusy,
    message,
    handleMessage,
    handleTimerExpire,
    handleShowQuestion,
    handleShowLeaderboard,
    handleEndGame,
  } = useAdminGame(gameSession, gameId, questions);

  // Loading and Error States
  if (gameLoading || questionsLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!gameSession) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-secondary mb-4">
          Game Not Found
        </h1>
        <p className="text-neutral-300 mb-6">
          Could not load game session.
        </p>
        <Link to="/admin">
          <Button variant="secondary">← Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display font-bold">
            {gameSession.gameName || 'Untitled Game'}
          </h1>
          <p className="text-neutral-300 mt-2">
            Game PIN:{' '}
            <span className="text-primary-light font-semibold">
              {gameSession.gamePin}
            </span>
          </p>
        </div>
        <Link to="/admin">
          <Button variant="secondary">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === 'error'
              ? 'bg-secondary'
              : 'bg-primary-dark text-white'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls & Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Controls */}
          <Card>
            <CardContent className="p-6">
              <CardTitle className="mb-4">Game Controls</CardTitle>
              <AdminControls
                gameSession={gameSession}
                questions={questions}
                isBusy={isBusy}
                onShowQuestion={handleShowQuestion}
                onShowLeaderboard={handleShowLeaderboard}
                onEndGame={handleEndGame}
              />
            </CardContent>
          </Card>

          {/* Game Status */}
          <Card>
            <CardContent className="p-6">
              <CardTitle className="mb-4">Current Status</CardTitle>
              <GameStatus gameSession={gameSession} />
              {gameSession.state === 'questionactive' &&
                // --- FIX WAS HERE ---
                // We must check for questionDuration, not timeLimit
                gameSession.questionDuration &&
                gameSession.questionStartTime && (
                  <div className="mt-4">
                    <Timer
                      // --- AND HERE ---
                      // The key must be the index, not an undefined "Id"
                      key={gameSession.currentQuestionIndex} 
                      startTime={gameSession.questionStartTime}
                      // --- AND HERE ---
                      // The duration prop is questionDuration
                      duration={gameSession.questionDuration} 
                      onExpire={handleTimerExpire}
                    />
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Share & Broadcast Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShareGameCard gamePin={gameSession.gamePin} gameId={gameId} />
            <BroadcastCard gameId={gameId} onMessage={handleMessage} />
          </div>
        </div>

        {/* Right Column - Live Player List */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <CardTitle className="mb-4">Live Players</CardTitle>
              <LivePlayerList gameId={gameId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}