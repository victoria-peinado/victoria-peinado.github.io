// src/components/stream/StreamQuestionView.jsx
import React from 'react';
// SPRINT 2: No longer import static questionBank

// SPRINT 2: Accept 'questions' prop
function StreamQuestionView({ gameSession, questions }) {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="text-2xl text-purple-400 mb-4">
            Question {gameSession.currentQuestionIndex + 1}
          </div>
          <h1 className="text-6xl font-bold mb-8">
            {currentQuestion.question}
          </h1>
        </div>

        {/* Answer choices */}
        <div className="grid grid-cols-2 gap-6">
          {/* SPRINT 2: 'answers' is now an array of objects */}
          {currentQuestion.answers.map((answer) => (
            <div
              key={answer.letter}
              className="bg-gray-800 border-4 border-gray-600 rounded-2xl p-8 text-center"
            >
              <div className="text-3xl font-bold mb-2">{answer.letter}</div>
              <div className="text-xl text-gray-300">
                {answer.text}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-gray-400">
          Answer on your device!
        </div>
      </div>
    </div>
  );
}

export default StreamQuestionView;