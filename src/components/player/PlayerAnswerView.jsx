// src/components/player/PlayerAnswerView.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import

function PlayerAnswerView({ gameSession, questions, selectedAnswer, hasAnswered }) {
  const { t } = useTranslation(); // 2. Initialize

  if (!gameSession || !questions || questions.length === 0) {
    return <div className="text-center text-neutral-100"><p>{t('player.answer.loading')}</p></div>;
  }
  const currentQuestion = questions[gameSession.currentQuestionIndex];
  if (!currentQuestion) {
    return <div className="text-center text-neutral-100"><p>{t('player.answer.loading')}</p></div>;
  }

  const correctAnswer = currentQuestion.answers?.find(
    ans => ans.letter === currentQuestion.correctLetter
  );
  const isCorrect = selectedAnswer === currentQuestion.correctLetter;

  return (
    <div className="max-w-2xl mx-auto">
      {/* 3. Main Result Box (Themed) */}
      <div className={`rounded-lg p-8 mb-6 text-white ${
          isCorrect ? 'bg-primary' : 'bg-secondary' // Use theme colors
        }`}>
        <h2 className="text-4xl font-display font-bold mb-4">
          {isCorrect ? t('player.answer.correct') : t('player.answer.incorrect')}
        </h2>
        
        {!hasAnswered && (
          <p className="text-xl mb-4">{t('player.answer.noAnswer')}</p>
        )}

        {/* 4. Question Info Box (Themed) */}
        <div className="bg-neutral-800 border border-neutral-700 rounded p-4 mt-4">
          <p className="text-lg font-bold text-neutral-200 mb-2">{t('player.answer.questionLabel')}</p>
          <p className="text-xl text-neutral-100 mb-4">{currentQuestion.question}</p>
          
          <p className="text-lg font-bold text-neutral-200 mb-2">{t('player.answer.correctLabel')}</p>
          <p classNameclassName="text-2xl font-bold text-primary-light">
            {currentQuestion.correctLetter}. {correctAnswer?.text || 'N/A'}
          </p>
        </div>

        {/* 5. "Your Answer" Box (Themed) */}
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