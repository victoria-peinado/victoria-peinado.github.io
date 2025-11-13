// Update PlayerQuestionView.jsx to include timer
import React from 'react';
import Timer from '../common/Timer';

function PlayerQuestionView({
  gameSession,
  questions,
  onAnswerSelect,
  hasAnswered,
  isSubmitting,
  selectedAnswer,
}) {
  const currentQuestion = questions[gameSession.currentQuestionIndex];
  const [timeExpired, setTimeExpired] = React.useState(false);

  if (!currentQuestion) {
    return (
      <div className="text-center text-white">
        <h2 className="text-3xl font-bold mb-4">All questions completed!</h2>
        <p className="text-xl">Waiting for final results...</p>
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

      <div className="text-center mb-8">
        <div className="text-xl text-purple-200 mb-4">
          Question {gameSession.currentQuestionIndex + 1}
        </div>
        <h2 className="text-4xl font-bold text-white mb-8">
          {currentQuestion.question}
        </h2>
      </div>

      {hasAnswered && (
        <div className="mb-6 p-4 bg-blue-600 rounded-lg text-center">
          <p className="text-white font-semibold">
            ✓ Answer submitted! Waiting for other players...
          </p>
        </div>
      )}

      {timeExpired && !hasAnswered && (
        <div className="mb-6 p-4 bg-red-600 rounded-lg text-center">
          <p className="text-white font-semibold">
             Time's up! No answer submitted.
          </p>
        </div>
      )}

      {/* Answer choices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.answers.map((answer) => {
          const isSelected = selectedAnswer === answer.letter;
          const isDisabled = hasAnswered || isSubmitting || timeExpired;

          return (
            <button
              key={answer.letter}
              onClick={() => handleAnswerClick(answer)}
              disabled={isDisabled}
              className={`
                p-6 rounded-lg text-lg font-semibold transition-all
                ${isSelected 
                  ? 'bg-blue-600 text-white ring-4 ring-blue-300' 
                  : 'bg-white text-gray-800 hover:bg-gray-100'
                }
                ${isDisabled 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:scale-105 cursor-pointer'
                }
              `}
            >
              <span className="text-2xl font-bold mr-3">{answer.letter}.</span>
              {answer.text}
            </button>
          );
        })}
      </div>

      {isSubmitting && (
        <div className="mt-6 text-center">
          <p className="text-white text-lg">Submitting your answer...</p>
        </div>
      )}
    </div>
  );
}

export default PlayerQuestionView;