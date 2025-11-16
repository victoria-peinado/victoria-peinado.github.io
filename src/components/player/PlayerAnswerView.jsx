// src/components/player/PlayerAnswerView.jsx
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../hooks/useAudio';

function PlayerAnswerView({ gameSession, questions, selectedAnswer, hasAnswered }) {
  // --- HOOKS MOVED TO TOP ---
  const { t } = useTranslation();
  const { playSound } = useAudio();

  // 1. Calculate derived state (isCorrect) first
  const currentQuestion = gameSession?.questions?.[gameSession.currentQuestionIndex] || questions?.[gameSession.currentQuestionIndex];
  const isCorrect = currentQuestion ? selectedAnswer === currentQuestion.correctLetter : false;

  // 2. useEffect for audio is now safely at the top
  useEffect(() => {
    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('incorrect');
    }
    // We only want this to run once when the component appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // isCorrect won't change after this view renders

  // --- CONDITIONAL RETURNS NOW HAPPEN AFTER HOOKS ---
  if (!gameSession || !questions || questions.length === 0 || !currentQuestion) {
    return <div className="text-center text-neutral-100"><p>{t('player.answer.loading')}</p></div>;
  }
  // (The second guard return from the original file was redundant)

  const correctAnswer = currentQuestion.answers?.find(
    ans => ans.letter === currentQuestion.correctLetter
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Main Result Box (Themed) */}
      <div className={`rounded-lg p-8 mb-6 text-white ${
          isCorrect ? 'bg-primary' : 'bg-secondary' // Use theme colors
        }`}>
        <h2 className="text-4xl font-display font-bold mb-4">
          {isCorrect ? t('player.answer.correct') : t('player.answer.incorrect')}
        </h2>
        
        {!hasAnswered && (
          <p className="text-xl mb-4">{t('player.answer.noAnswer')}</p>
        )}

        {/* Question Info Box (Themed) */}
        <div className="bg-neutral-800 border border-neutral-700 rounded p-4 mt-4">
          <p className="text-lg font-bold text-neutral-200 mb-2">{t('player.answer.questionLabel')}</p>
          <p className="text-xl text-neutral-100 mb-4">{currentQuestion.question}</p>
          
          <p className="text-lg font-bold text-neutral-200 mb-2">{t('player.answer.correctLabel')}</p>
          <p className="text-2xl font-bold text-primary-light">
            {currentQuestion.correctLetter}. {correctAnswer?.text || 'N/A'}
          </p>
        </div>

        {/* "Your Answer" Box (Themed) */}
        {hasAnswered && selectedAnswer && !isCorrect && (
          <div className="mt-4 bg-black bg-opacity-20 rounded p-4">
            <p className="text-lg">{t('player.answer.yourAnswer')} <span className="font-bold">{selectedAnswer}</span></p>
          </div>
        )}
      </div>

      <div className="text-center text-neutral-100">
        <p className="text-xl">{t('player.answer.waitingNext')}</p>
      </div>
    </div>
  );
}

export default PlayerAnswerView;