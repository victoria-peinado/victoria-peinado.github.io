// src/components/stream/StreamAnswerView.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import

function StreamAnswerView({ gameSession, questions }) {
  const { t } = useTranslation(); // 2. Initialize
  const currentQuestion = questions[gameSession.currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="text-center">
        {/* 3. Apply theme fonts and i18n */}
        <h1 className="text-5xl font-display font-bold mb-4">
          {t('stream.final.title')}
        </h1>
        <p className="text-2xl text-neutral-200">
          {t('stream.final.subtitle')}
        </p>
      </div>
    );
  }

  const correctAnswer = currentQuestion.answers.find(
    a => a.letter === currentQuestion.correctLetter
  );

  return (
    // 4. Remove the hardcoded gradient. The StreamPage handles the background.
    <div className="w-full">
      <div className="text-center mb-12">
        {/* 5. Apply theme fonts and colors */}
        <div className="text-2xl font-display text-primary mb-4">
          {t('stream.question.header', { num: gameSession.currentQuestionIndex + 1 })}
        </div>
        <h1 className="text-5xl font-display font-bold text-neutral-100 mb-8">
          {currentQuestion.question}
        </h1>
        
        <div className="text-3xl font-body text-primary-light font-bold mb-8">
          {t('stream.answer.correct')} {currentQuestion.correctLetter}
        </div>
        <div className="text-2xl font-body text-neutral-100">
          {correctAnswer?.text || 'Answer not found'}
        </div>
      </div>

      {/* 6. Re-style answer choices with theme colors */}
      <div className="grid grid-cols-2 gap-6">
        {currentQuestion.answers.map((answer) => {
          const isCorrect = answer.letter === currentQuestion.correctLetter;
          return (
            <div
              key={answer.letter}
              className={`rounded-lg p-8 text-center transition-all ${
                isCorrect
                  // "Correct" style: Our "Mana Green"
                  ? 'bg-primary scale-105 ring-4 ring-primary-light'
                  // "Incorrect" style: Our standard "Stone" card
                  : 'bg-neutral-800 border-2 border-neutral-700 opacity-50'
              }`}
            >
              <div className={`text-4xl font-display font-bold mb-2 ${isCorrect ? 'text-white' : 'text-primary-light'}`}>
                {answer.letter}
              </div>
              <div className={`text-2xl font-body ${isCorrect ? 'text-white font-bold' : 'text-neutral-100'}`}>
                {answer.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StreamAnswerView;