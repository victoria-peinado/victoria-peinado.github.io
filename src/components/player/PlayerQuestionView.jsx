// src/components/player/PlayerQuestionView.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import
import Timer from '../common/Timer';
import { Button } from '../ui/Button'; // 2. Import our new Button

function PlayerQuestionView({
  gameSession,
  questions,
  onAnswerSelect,
  hasAnswered,
  isSubmitting,
  selectedAnswer,
}) {
  const { t } = useTranslation(); // 3. Initialize
  const currentQuestion = questions[gameSession.currentQuestionIndex];
  const [timeExpired, setTimeExpired] = React.useState(false);

  if (!currentQuestion) {
    return (
      <div className="text-center text-neutral-100">
        <h2 className="text-3xl font-display font-bold mb-4">{t('player.question.allDoneTitle')}</h2>
        <p className="text-xl">{t('player.question.allDoneSubtitle')}</p>
      </div>
    );
  }

  const handleAnswerClick = (answer) => {
    if (hasAnswered || isSubmitting || timeExpired) return;
    onAnswerSelect({
      letter: answer.letter,
      correct: answer.letter === currentQuestion.correctLetter
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Timer */}
      {gameSession.questionStartTime && (
        <div className="mb-6">
          <Timer
            startTime={gameSession.questionStartTime}
            duration={gameSession.questionDuration || 30}
            onExpire={() => setTimeExpired(true)}
          />
        </div>
      )}

      {/* Question Text */}
      <div className="text-center mb-8">
        <div className="text-xl font-display text-primary mb-4">
          {t('player.question.header', { num: gameSession.currentQuestionIndex + 1 })}
        </div>
        <h2 className="text-4xl font-display font-bold text-neutral-100 mb-8">
          {currentQuestion.question}
        </h2>
      </div>

      {/* Status Banners (Themed) */}
      {hasAnswered && (
        <div className="mb-6 p-4 bg-primary-dark rounded-lg text-center">
          <p className="text-white font-semibold">{t('player.question.submitted')}</p>
        </div>
      )}
      {timeExpired && !hasAnswered && (
        <div className="mb-6 p-4 bg-secondary rounded-lg text-center">
          <p className="text-white font-semibold">{t('player.question.timeUp')}</p>
        </div>
      )}

      {/* Answer choices (Refactored) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.answers.map((answer) => {
          const isSelected = selectedAnswer === answer.letter;
          const isDisabled = hasAnswered || isSubmitting || timeExpired;

          return (
            // 4. Use our new Button component
            <Button
              key={answer.letter}
              onClick={() => handleAnswerClick(answer)}
              disabled={isDisabled}
              // Use 'primary' for selected, 'neutral' for others
              variant={isSelected ? 'primary' : 'neutral'}
              // Add classes for left-alignment and text size
              className="text-lg text-left justify-start"
            >
              <span className="text-2xl font-bold mr-3">{answer.letter}.</span>
              {answer.text}
            </Button>
          );
        })}
      </div>

      {isSubmitting && (
        <div className="mt-6 text-center">
          <p className="text-neutral-100 text-lg">{t('player.question.submitting')}</p>
        </div>
      )}
    </div>
  );
}

export default PlayerQuestionView;