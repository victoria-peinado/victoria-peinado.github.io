import React from 'react';
import { useParams } from 'react-router-dom';
import { useGameSession } from '../hooks/useGameSession';

import Leaderboard from '../components/common/Leaderboard';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';
import StreamWaitingView from '../components/stream/StreamWaitingView';
import StreamQuestionView from '../components/stream/StreamQuestionView';
import StreamAnswerView from '../components/stream/StreamAnswerView';

function renderGameState(gameSession) {
  switch (gameSession.state) {
    case 'waiting':
      return <StreamWaitingView gameSession={gameSession} />;
    
    case 'questionactive':
      return <StreamQuestionView gameSession={gameSession} />;
    
    case 'answerrevealed': 
      return <StreamAnswerView gameSession={gameSession} />;
    
    case 'leaderboard':
      return <Leaderboard gameId={gameSession.id} />;
    
    default:
      return <StreamWaitingView gameSession={gameSession} />;
  }
}

export default function StreamPage() {
  const { gameId } = useParams();
  const { gameSession, loading, error } = useGameSession(gameId);

  if (loading) {
    return <LoadingScreen message="Loading game..." />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  // This is the view for "Waiting for host to start"
  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white p-8 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <div className="text-9xl mb-8 animate-bounce">⏱</div>
          <h1 className="text-6xl font-bold text-purple-400 mb-6">
            Waiting for Game
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            This screen will update when the host starts the game.
          </p>
          {/* FIX: Removed the Game ID from this loading screen.
            The Game PIN is now only shown in the persistent footer
            once the game session has loaded, to avoid inconsistency.
          */}
        </div>
      </div>
    );
  }

  // This is the main view for an active game
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 text-white relative">
      {/* Main game content */}
      <div className="min-h-screen">
        {renderGameState(gameSession)}
      </div>

      {/* Persistent Game PIN Footer */}
      <footer className="absolute bottom-0 left-0 w-full p-4 text-center">
        <div className="inline-block bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          <p className="text-lg font-bold text-gray-200 tracking-widest">
            {/* This will now display the mixed-case 'gamePin' field */}
            Game PIN: {gameSession.gamePin}
          </p>
        </div>
      </footer>
    </div>
  );
}