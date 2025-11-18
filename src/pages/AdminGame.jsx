// src/pages/AdminGame.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';

// --- CORE HOOKS ---
import { useGameSession } from '../hooks/useGameSession';
import { useQuestionBank } from '../hooks/useQuestionBank';

// --- NEW HOOK ---
import { useAdminGame } from '../hooks/useAdminGame'; // This hook now provides EVERYTHING

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

  // Logic hook - This one call now returns all state and handlers
  const {
    isBusy,
    handleTimerExpire,
    handleShowQuestion,
    handleShowLeaderboard,
    handleEndGame,
    // New props from useBroadcast
    broadcastInput,
    setBroadcastInput,
    isSending,
    handleSendBroadcast,
    // New props from useShareLink
    copied,
    shareUrl,
    handleCopyLink,
  } = useAdminGame(gameSession, gameId, questions);

  // Loading and Error States
  if (gameLoading || questionsLoading) {
    return <LoadingScreen />;
  }
  // ... (Error handling is unchanged) ...
  if (error) {
    return <ErrorScreen message={error} />;
  }
  if (!gameSession) {
    // ... (Game not found is unchanged) ...
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
      {/* Header (Unchanged) */}
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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls & Status (Unchanged) */}
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

          {/* Game Status (Unchanged) */}
          <Card>
            <CardContent className="p-6">
              <CardTitle className="mb-4">Current Status</CardTitle>
              <GameStatus gameSession={gameSession} />
              {gameSession.state === 'questionactive' &&
                gameSession.questionDuration &&
                gameSession.questionStartTime && (
                  <div className="mt-4">
                    <Timer
                      key={gameSession.currentQuestionIndex} 
                      startTime={gameSession.questionStartTime}
                      duration={gameSession.questionDuration} 
                      onExpire={handleTimerExpire}
                    />
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Share & Broadcast Cards (NOW DUMB) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShareGameCard
              gamePin={gameSession.gamePin}
              copied={copied}
              shareUrl={shareUrl}
              handleCopyLink={handleCopyLink}
            />
            <BroadcastCard
              broadcastInput={broadcastInput}
              setBroadcastInput={setBroadcastInput}
              isSending={isSending}
              handleSendBroadcast={handleSendBroadcast}
            />
          </div>
        </div>

        {/* Right Column - Live Player List (Unchanged) */}
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