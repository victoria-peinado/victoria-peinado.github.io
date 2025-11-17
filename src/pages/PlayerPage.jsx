// src/pages/PlayerPage.jsx
import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// --- IMPORT HOOKS ---
import { useGameSession } from '../hooks/useGameSession';
import { useQuestionBank } from '../hooks/useQuestionBank';
import { useAuth } from '../contexts/AuthContext';
import { usePlayerAuth } from '../hooks/usePlayerAuth';
import { usePlayerJoin } from '../hooks/usePlayerJoin';
import { usePlayerState } from '../hooks/usePlayerState';
import { usePlayerActions } from '../hooks/usePlayerActions';
import { useAudio } from '../hooks/useAudio'; // 2. Import useAudio

// --- IMPORT COMPONENTS ---
import PlayerJoinForm from '../components/player/PlayerJoinForm';
import PlayerWaitingView from '../components/player/PlayerWaitingView';
import PlayerQuestionView from '../components/player/PlayerQuestionView';
import PlayerAnswerView from '../components/player/PlayerAnswerView';
import Leaderboard from '../components/common/Leaderboard';
import FinalLeaderboard from '../components/common/FinalLeaderboard'; 
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';
import PlayerNavbar from '../components/layout/PlayerNavbar';
import AdminMessageOverlay from '../components/common/AdminMessageOverlay';
import FullScreenCenter from '../components/layout/FullScreenCenter';

export default function PlayerPage() {
  const { gameId } = useParams();
  const { t } = useTranslation();
  const { currentUser, loading: authLoading } = useAuth();
  const { setMusic } = useAudio(); // 3. Get setMusic
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const handleMessage = (text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const { gameSession, loading: gameLoading, error: gameError } = useGameSession(gameId);
  const { questions } = useQuestionBank(gameSession?.questionBankId);

  const { playerId, setPlayerId, nickname, setNickname, isVerifying } = usePlayerAuth(gameId, currentUser, authLoading);
  const { isJoining, handleJoinGame } = usePlayerJoin(gameSession, currentUser, (uid, joinedNickname) => {
    setPlayerId(uid);
    setNickname(joinedNickname);
  }, handleMessage);
  
  const { adminMessage, setAdminMessage } = usePlayerState(gameId, playerId, gameSession);
  const { selectedAnswer, hasAnswered, isSubmitting, handleAnswerSubmit } = usePlayerActions(gameId, playerId, gameSession, handleMessage);

  // 4. NEW: Add state-driven music logic
  useEffect(() => {
    if (!gameSession) return;

    switch (gameSession.state) {
      case 'waiting':
        setMusic('music_lobby.mp3');
        break;
      case 'questionactive':
        setMusic('music_question.mp3');
        break;
      case 'answerrevealed':
      case 'leaderboard':
        setMusic('music_lobby.mp3');
        break;
      case 'finished':
        // FinalLeaderboard component handles its own music
        break;
      default:
        // Do nothing for unknown states
    }
  }, [gameSession?.state, setMusic]); // Re-run when state or setMusic changes

  if (authLoading || gameLoading || isVerifying) {
    return <LoadingScreen message={t('loading.game')} />;
  }
  if (gameError) return <ErrorScreen message={gameError} />;
  if (!gameSession) return <ErrorScreen message={t('error.gameNotFound')} />;

  // NEW: Get the theme from the game session [cite: 34]
  const theme = gameSession.theme || 'default';

  // --- NOT JOINED YET ---
  if (!playerId) {
    return (
      // We apply the theme here too, so the join page is themed
      <div className={`theme-${theme}`}> 
        <FullScreenCenter>
          <div className="max-w-md w-full">
            {message.text && (
              <div className={`mb-4 p-4 rounded text-white ${message.type === 'error' ? 'bg-secondary' : 'bg-primary-dark'}`}>
                {message.text}
              </div>
            )}
            <PlayerJoinForm
              nickname={nickname}
              onNicknameChange={setNickname}
              onJoinGame={(e) => handleJoinGame(e, nickname)}
              isJoining={isJoining}
            />
          </div>
        </FullScreenCenter>
      </div>
    );
  }

  // --- JOINED ---
  const renderGameState = () => {
    switch (gameSession.state) {
      case 'waiting':
        return <PlayerWaitingView nickname={nickname} />;
      case 'questionactive':
        return <PlayerQuestionView gameSession={gameSession} questions={questions} onAnswerSelect={handleAnswerSubmit} hasAnswered={hasAnswered} isSubmitting={isSubmitting} selectedAnswer={selectedAnswer} />;
      case 'answerrevealed':
        return <PlayerAnswerView gameSession={gameSession} questions={questions} selectedAnswer={selectedAnswer} hasAnswered={hasAnswered} />;
      case 'leaderboard':
        return <div className="text-center"><h2 className="text-4xl font-display text-primary-light mb-8">{t('leaderboard.title')}</h2><Leaderboard gameId={gameSession.id} /></div>;
      case 'finished':
        return <FinalLeaderboard gameId={gameSession.id} />;
      default:
        return <div className="text-center text-neutral-100"><p className="text-xl">{t('error.unknownState')}: {gameSession.state}</p></div>;
    }
  };

  return (
    // UPDATED: Dynamically add the theme class [cite: 38]
    <div className={`theme-${theme} min-h-screen bg-neutral-900 text-neutral-100 font-body p-8`}>
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
        {renderGameState()}
      </div>
    </div>
  );
}