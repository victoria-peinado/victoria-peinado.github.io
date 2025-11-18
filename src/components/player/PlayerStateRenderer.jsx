// src/components/player/PlayerStateRenderer.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

// Import the views this component will render
import PlayerWaitingView from './PlayerWaitingView';
import PlayerQuestionView from './PlayerQuestionView';
import PlayerAnswerView from './PlayerAnswerView';
import Leaderboard from '../common/Leaderboard';
import FinalLeaderboard from '../common/FinalLeaderboard';
// 1. Import the new view
import PlayerSaveStatsView from './PlayerSaveStatsView';

/**
 * This is a "dumb" component. It receives all data as props
 * and simply decides which UI to render based on the game state.
 */
export default function PlayerStateRenderer({
  gameSession,
  nickname,
  questions,
  onAnswerSelect,
  hasAnswered,
  isSubmitting,
  selectedAnswer,
  // 2. Add new props
  isAnonymous,
  playerId,
}) {
  const { t } = useTranslation();

  switch (gameSession?.state) {
    case 'waiting':
      return <PlayerWaitingView nickname={nickname} />;

    case 'questionactive':
      return (
        <PlayerQuestionView
          gameSession={gameSession}
          questions={questions}
          onAnswerSelect={onAnswerSelect}
          hasAnswered={hasAnswered}
          isSubmitting={isSubmitting}
          selectedAnswer={selectedAnswer}
        />
      );

    case 'answerrevealed':
      return (
        <PlayerAnswerView
          gameSession={gameSession}
          questions={questions}
          selectedAnswer={selectedAnswer}
          hasAnswered={hasAnswered}
        />
      );

    case 'leaderboard':
      return (
        <div className="text-center">
          <h2 className="text-4xl font-display text-primary-light mb-8">
            {t('leaderboard.title')}
          </h2>
          <Leaderboard gameId={gameSession.id} />
        </div>
      );

    // --- 3. SPRINT 16: UPDATED LOGIC ---
    case 'finished':
      if (isAnonymous) {
        // 4. Show "Save Stats" prompt to anonymous users
        return <PlayerSaveStatsView gameId={gameSession.id} playerId={playerId} />;
      } else {
        // 5. Show normal leaderboard to registered users
        return <FinalLeaderboard gameId={gameSession.id} />;
      }
    // --- END SPRINT 16 ---

    default:
      return (
        <div className="text-center text-neutral-100">
          <p className="text-xl">
            {t('error.unknownState')}: {gameSession?.state || 'N/A'}
          </p>
        </div>
      );
  }
}