// src/components/stream/StreamQuestionView.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import
import Timer from '../common/Timer';

function StreamQuestionView({ gameSession, questions }) {
  const { t } = useTranslation(); // 2. Initialize
  const currentQuestion = questions[gameSession.currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="text-center">
        {/* 3. Apply theme fonts and i18n */}
        <h1 className="text-5xl font-display font-bold mb-4">
          {t('stream.gameOver.title')}
        </h1>
        <p className="text-2xl text-neutral-200">
          {t('stream.gameOver.subtitle')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Timer */}
      {gameSession.questionStartTime && (
        <div className="mb-8">
          <Timer
            startTime={gameSession.questionStartTime}
            duration={gameSession.questionDuration || 30}
          />
        </div>
      )}

      <div className="text-center mb-12">
        {/* 4. Apply theme fonts and colors */}
        <div className="text-2xl font-display text-primary mb-4">
          {t('stream.question.header', { num: gameSession.currentQuestionIndex + 1 })}
        </div>
        <h1 className="text-6xl font-display font-bold text-neutral-100">
          {currentQuestion.question}
        </h1>
      </div>

      {/* 5. Re-style answer choices */}
      <div className="grid grid-cols-2 gap-6">
        {currentQuestion.answers.map((answer) => (
          <div
            key={answer.letter}
            // Use our "Primal Mana" card style
            className="bg-neutral-800 border-2 border-neutral-700 
                       rounded-lg p-8 text-center"
          >
            <div className="text-4xl font-display font-bold text-primary-light mb-2">
              {answer.letter}
            </div>
            <div className="text-2xl font-body text-neutral-100">
              {answer.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StreamQuestionView;