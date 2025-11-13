// src/components/stream/StreamAnswerView.jsx
import React from 'react';
// SPRINT 2: No longer import static questionBank

// SPRINT 2: Accept 'questions' prop
function StreamAnswerView({ gameSession, questions }) {
  // SPRINT 2: Find question from the 'questions' array prop
  const currentQuestion = questions[gameSession.currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Game Over!</h1>
          <p className="text-2xl text-gray-300">All questions completed.</p>
        </div>
      </div>
    );
  }

  // SPRINT 2: Find correct answer from 'correctLetter' field
  const correctAnswer = currentQuestion.answers.find(
    a => a.letter === currentQuestion.correctLetter
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-900 via-gray-900 to-blue-900">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="text-8xl mb-6"></div>
          <div className="text-2xl text-green-400 mb-4">
            Question {gameSession.currentQuestionIndex + 1} - Answer
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-8 px-4">
            {currentQuestion.question}
          </h1>
        </div>

        {/* All answer choices with correct one highlighted */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SPRINT 2: 'answers' is now an array of objects */}
          {currentQuestion.answers.map((answer) => (
            <div
              key={answer.letter}
              className={`
                rounded-2xl p-8 text-center border-4 transition-all
                ${answer.letter === currentQuestion.correctLetter
                  ? 'bg-green-700 border-green-400 animate-pulse' 
                  : 'bg-gray-800 border-gray-600 opacity-50'
                }
              `}
            >
              <div className="text-3xl font-bold mb-3">
                {answer.letter} {answer.letter === currentQuestion.correctLetter && '✓'}
              </div>
              <div className="text-xl text-gray-100">{answer.text}</div>
            </div>
          ))}
        </div>

        {correctAnswer && (
          <div className="text-center mt-12">
            <div className="text-3xl font-bold text-green-400 mb-2">
              Correct Answer: {correctAnswer.letter}
            </div>
            <div className="text-xl text-gray-300">
              {correctAnswer.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StreamAnswerView;