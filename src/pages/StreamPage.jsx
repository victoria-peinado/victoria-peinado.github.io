// src/pages/StreamPage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameSession } from '../hooks/useGameSession';
import { useQuestionBank } from '../hooks/useQuestionBank';
import { useAudio } from '../hooks/useAudio';
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
  const { t } = useTranslation();
  const { gameSession, loading, error } = useGameSession(gameId);
  const { questions } = useQuestionBank(gameSession?.questionBankId);
  const { setMusic } = useAudio();

  useEffect(() => {
    if (!gameSession) return;
    switch (gameSession.state) {
      case 'waiting': setMusic('music_lobby.mp3'); break;
      case 'questionactive': setMusic('music_question.mp3'); break;
      case 'answerrevealed': case 'leaderboard': setMusic('music_lobby.mp3'); break;
      case 'finished': break;
      default:
    }
  }, [gameSession?.state, setMusic]);

  if (loading) {
    return <LoadingScreen message={t('loading.game')} />;
  }
  if (error) {
    return <ErrorScreen message={error} />;
  }
  if (!gameSession) {
    return <ErrorScreen message={t('error.gameNotFound')} />;
  }

  // --- UPDATED THEME LOGIC ---
  const theme = gameSession.theme || 'default';
  const customThemeData = gameSession.customThemeData || null;

  // Define the style object to override CSS variables
  // This now includes ALL theme variables from your picker
  const themeStyles = (theme === 'custom' && customThemeData) ? {
    '--color-primary': customThemeData.primary,
    '--color-primary-light': customThemeData.primaryLight,
    '--color-primary-dark': customThemeData.primaryDark,
    '--color-secondary': customThemeData.secondary,
    '--color-secondary-dark': customThemeData.secondaryDark,
    '--color-text-on-primary': customThemeData.textOnPrimary, // <-- FIX 
    '--color-accent-green': customThemeData.accentGreen,     // <-- ADDED
    '--color-accent-blue': customThemeData.accentBlue,       // <-- ADDED
    '--color-accent-black': customThemeData.accentBlack,     // <-- ADDED
  } : {};
  // --- END UPDATED THEME LOGIC ---

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
    // Apply theme and custom styles to the main game page
    <div 
      className={`theme-${theme} min-h-screen bg-neutral-900 text-neutral-100 font-body 
                  flex items-center justify-center p-8 relative`}
      style={themeStyles}
    >
      <StreamHeader gamePin={gameSession.gamePin || gameId} />
      <div className="w-full max-w-6xl">
        {renderGameState()}
      </div>
    </div>
  );
}