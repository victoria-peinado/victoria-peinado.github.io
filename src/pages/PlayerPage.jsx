// src/pages/PlayerPage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// --- IMPORT HOOKS (NOW CLEAN!) ---
import { useGameSession } from '../hooks/useGameSession';
import { useQuestionBank } from '../hooks/useQuestionBank';
import { useAudio } from '../hooks/useAudio';
import { usePlayerSession } from '../hooks/player/usePlayerSession'; // <-- THE NEW HOOK

// --- IMPORT COMPONENTS ---
import PlayerJoinForm from '../components/player/PlayerJoinForm';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';
import PlayerNavbar from '../components/layout/PlayerNavbar';
import AdminMessageOverlay from '../components/common/AdminMessageOverlay';
import FullScreenCenter from '../components/layout/FullScreenCenter';
import PlayerStateRenderer from '../components/player/PlayerStateRenderer';

export default function PlayerPage() {
  const { gameId } = useParams();
  const { t } = useTranslation();
  const { setMusic } = useAudio();
  
  // Data hooks remain
  const { gameSession, loading: gameLoading, error: gameError } = useGameSession(gameId);
  const { questions } = useQuestionBank(gameSession?.questionBankId);

  // All player logic is now in this one hook
  const {
    isLoading: playerLoading,
    playerId,
    adminMessage,
    setAdminMessage,
    message,
    joinForm,
    rendererProps,
  } = usePlayerSession(gameSession);

  // Music effect remains
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

  // Combined loading state
  if (playerLoading || gameLoading) {
    return <LoadingScreen message={t('loading.game')} />;
  }
  if (gameError) return <ErrorScreen message={gameError} />;
  if (!gameSession) return <ErrorScreen message={t('error.gameNotFound')} />;

  // Theme logic remains
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
  // --- END THEME LOGIC ---

  // --- NOT JOINED YET ---
  // This block is now much cleaner
  if (!playerId) {
    return (
      <div className={`theme-${theme}`} style={themeStyles}> 
        <FullScreenCenter>
          <div className="max-w-md w-full">
            {message.text && (
              <div className={`mb-4 p-4 rounded text-white ${message.type === 'error' ? 'bg-secondary' : 'bg-primary-dark'}`}>
                {message.text}
              </div>
            )}
            <PlayerJoinForm
              nickname={joinForm.nickname}
              onNicknameChange={joinForm.setNickname}
              onJoinGame={(e) => joinForm.handleJoinGame(e, joinForm.nickname)}
              isJoining={joinForm.isJoining}
            />
          </div>
        </FullScreenCenter>
      </div>
    );
  }

  // --- JOINED ---
  // This block is now much cleaner
  return (
    <div 
      className={`theme-${theme} min-h-screen bg-neutral-900 text-neutral-100 font-body p-8`}
      style={themeStyles}
    >
      <AdminMessageOverlay 
        message={adminMessage} 
        onClose={() => setAdminMessage(null)} 
      />
      
      <PlayerNavbar />
      <div className="max-w-4xl mx-auto mt-4">
        {message.text && (
          <div className={`mb-4 p-4 rounded text-white ${message.type === 'error' ? 'bg-secondary' : 'bg-primary-dark'}`}>
            {message.text}
          </div>
        )}
        
        <PlayerStateRenderer
          gameSession={gameSession}
          questions={questions}
          // Pass the composed props down
          {...rendererProps}
        />
      </div>
    </div>
  );
}