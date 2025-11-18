// src/pages/StreamPage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameSession } from '../hooks/useGameSession';
import { useQuestionBank } from '../hooks/useQuestionBank';
import { useAudio } from '../hooks/useAudio';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';
import StreamHeader from '../components/stream/StreamHeader';
import StreamStateRenderer from '../components/stream/StreamStateRenderer'; // <-- NEW IMPORT

export default function StreamPage() {
  const { gameId } = useParams();
  const { t } = useTranslation();
  const { gameSession, loading, error } = useGameSession(gameId);
  const { questions } = useQuestionBank(gameSession?.questionBankId);
  const { setMusic } = useAudio();

  useEffect(() => { // <-- FIX: Removed the stray period
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

  const themeStyles = (theme === 'custom' && customThemeData) ? {
    '--color-primary': customThemeData.primary,
    '--color-primary-light': customThemeData.primaryLight,
    '--color-primary-dark': customThemeData.primaryDark,
    '--color-secondary': customThemeData.secondary,
    '--color-secondary-dark': customThemeData.secondaryDark,
    '--color-text-on-primary': customThemeData.textOnPrimary,
    '--color-accent-green': customThemeData.accentGreen,
    '--color-accent-blue': customThemeData.accentBlue,
    '--color-accent-black': customThemeData.accentBlack,
  } : {};
  // --- END UPDATED THEME LOGIC ---

  // The renderGameState function has been removed.

  return (
    // Apply theme and custom styles to the main game page
    <div 
      className={`theme-${theme} min-h-screen bg-neutral-900 text-neutral-100 font-body 
                  flex items-center justify-center p-8 relative`}
      style={themeStyles}
    >
      <StreamHeader gamePin={gameSession.gamePin || gameId} />
      <div className="w-full max-w-6xl">
        {/* The switch statement is replaced with this single component */}
        <StreamStateRenderer
          gameSession={gameSession}
          questions={questions}
        />
      </div>
    </div>
  );
}