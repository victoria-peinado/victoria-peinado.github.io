// src/components/stream/StreamStateRenderer.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

// Import the views this component will render
import StreamWaitingView from './StreamWaitingView';
import StreamQuestionView from './StreamQuestionView';
import StreamAnswerView from './StreamAnswerView';
import Leaderboard from '../common/Leaderboard';
import FinalLeaderboard from '../common/FinalLeaderboard';

/**
 * This is a "dumb" component. It receives all data as props
 * and simply decides which UI to render based on the game state.
 */
export default function StreamStateRenderer({ gameSession, questions }) {
  const { t } = useTranslation();

  switch (gameSession?.state) {
    case 'waiting':
      return <StreamWaitingView gamePin={gameSession.gamePin} />;

    case 'questionactive':
      return (
        <StreamQuestionView gameSession={gameSession} questions={questions} />
      );

    case 'answerrevealed':
      return (
        <StreamAnswerView gameSession={gameSession} questions={questions} />
      );

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
          <p className="text-2xl">
            {t('error.unknownState')}: {gameSession?.state || 'N/A'}
          </p>
        </div>
      );
  }
}