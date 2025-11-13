import React from 'react';
import { useParams } from 'react-router-dom';
import { useGameSession } from '../hooks/useGameSession';
import { useQuestionBank } from '../hooks/useQuestionBank';
import StreamWaitingView from '../components/stream/StreamWaitingView';
import StreamQuestionView from '../components/stream/StreamQuestionView';
import StreamAnswerView from '../components/stream/StreamAnswerView';
import Leaderboard from '../components/common/Leaderboard';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';

export default function StreamPage() {
  const { gameId } = useParams();
  const { gameSession, loading, error } = useGameSession(gameId);
  const { questions } = useQuestionBank(gameSession?.questionBankId);

  if (loading) {
    return <LoadingScreen message="Connecting to game..." />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!gameSession) {
    return <ErrorScreen message="Game not found." />;
  }

  const renderGameState = () => {
    switch (gameSession.state) {
      case 'waiting':
        return <StreamWaitingView gamePin={gameSession.gamePin} />;
      
      case 'questionactive':
        return <StreamQuestionView gameSession={gameSession} questions={questions} />;
      
      case 'answerrevealed':
        return <StreamAnswerView gameSession={gameSession} questions={questions} />;
      
      case 'leaderboard':
        return (
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-8">Leaderboard</h2>
            <Leaderboard gameId={gameSession.id} />
          </div>
        );
      
      case 'finished':
        return (
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-8">Game Over!</h1>
            <p className="text-3xl text-white mb-8">Until next time!</p>
            <Leaderboard gameId={gameSession.id} />
          </div>
        );
      
      default:
        return (
          <div className="text-center text-white">
            <p className="text-2xl">Unknown game state: {gameSession.state}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {renderGameState()}
      </div>
    </div>
  );
}