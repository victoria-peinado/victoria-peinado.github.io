// src/pages/StreamPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import
import { useGameSession } from '../hooks/useGameSession';
import { useQuestionBank } from '../hooks/useQuestionBank';
import StreamWaitingView from '../components/stream/StreamWaitingView';
import StreamQuestionView from '../components/stream/StreamQuestionView';
import StreamAnswerView from '../components/stream/StreamAnswerView';
import Leaderboard from '../components/common/Leaderboard';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';
import StreamHeader from '../components/stream/StreamHeader';
import FinalLeaderboard from '../components/common/FinalLeaderboard';

export default function StreamPage() {
  const { gameId } = useParams();
  const { t } = useTranslation(); // 2. Initialize
  const { gameSession, loading, error } = useGameSession(gameId);
  const { questions } = useQuestionBank(gameSession?.questionBankId);

  if (loading) {
    return <LoadingScreen message={t('loading.game')} />;
  }
  if (error) {
    return <ErrorScreen message={error} />;
  }
  if (!gameSession) {
    return <ErrorScreen message={t('error.gameNotFound')} />;
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
          <div className="text-center mt-48"> 
            {/* 3. Use i18n and display font */}
            <h2 className="text-5xl font-display font-bold text-primary-light mb-8">
              {t('leaderboard.title')}
            </h2>
            <Leaderboard gameId={gameSession.id} />
          </div>
        );
      case 'finished':
        return (
          <div className="text-center mt-48">
            <FinalLeaderboard gameId={gameSession.id} />
          </div>
        );
      default:
        return (
          <div className="text-center text-neutral-100 mt-48"> 
            <p className="text-2xl">{t('error.unknownState')}: {gameSession.state}</p>
          </div>
        );
    }
  };

  return (
    // 4. Use new theme background and fonts
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-body 
                    flex items-center justify-center p-8 relative">
      
      <StreamHeader gamePin={gameSession.gamePin || gameId} />

      <div className="w-full max-w-6xl">
        {renderGameState()}
      </div>
    </div>
  );
}