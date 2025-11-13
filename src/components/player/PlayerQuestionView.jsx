// src/components/player/PlayerQuestionView.jsx
import React from 'react';
// SPRINT 2: No longer import static questionBank

// SPRINT 2: Accept 'questions' prop
function PlayerQuestionView({
  gameSession,
  questions, 
  handleAnswerSubmit,
  hasAnswered,
  isSubmitting,
  selectedAnswer,
}) {
  // SPRINT 2: Find question from the 'questions' array prop
  const currentQuestion = questions[gameSession.currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">No more questions!</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-red-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Question {gameSession.currentQuestionIndex + 1}
          </h2>
          <p className="text-xl text-gray-300 mb-6">{currentQuestion.question}</p>
          {hasAnswered && (
            <div className="bg-green-600 text-white p-3 rounded-lg mb-4">
              Answer submitted: {selectedAnswer}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* SPRINT 2: 'answers' is now an array of objects */}
          {currentQuestion.answers.map((answer) => (
            <button
              key={answer.letter}
              onClick={() => handleAnswerSubmit(answer)}
              disabled={hasAnswered || isSubmitting}
              className={`
                p-6 text-left rounded-xl border-2 transition-all font-semibold
                ${hasAnswered && selectedAnswer === answer.letter
                  ? 'bg-green-700 border-green-500'
                  : hasAnswered
                  ? 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed'
                  : 'bg-gray-800 border-gray-600 hover:bg-blue-700 hover:border-blue-500 cursor-pointer'
                }
              `}
            >
              <div className="text-2xl">{answer.letter}. {answer.text}</div>
            </button>
          ))}
        </div>

        {isSubmitting && (
          <div className="text-center mt-6 text-gray-400">
            Submitting...
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerQuestionView;