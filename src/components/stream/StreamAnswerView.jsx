// src/components/stream/StreamAnswerView.jsx
import React from 'react';

function StreamAnswerView({ gameSession, questions }) {
  const currentQuestion = questions[gameSession.currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Until next time!</h1>
          <p className="text-2xl text-gray-300">All questions completed.</p>
        </div>
      </div>
    );
  }

  // FIXED: Find correct answer from correctLetter field
  const correctAnswer = currentQuestion.answers.find(
    a => a.letter === currentQuestion.correctLetter
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-900 via-gray-900 to-blue-900">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="text-8xl mb-6"></div>
          <div className="text-2xl text-green-400 mb-4">
            Question {gameSession.currentQuestionIndex + 1}
          </div>
          <h1 className="text-5xl font-bold mb-8">
            {currentQuestion.question}
          </h1>
          
          {/* FIXED: Display correctAnswer.text instead of correctAnswer object */}
          <div className="text-3xl text-green-300 font-bold mb-8">
            Correct Answer: {currentQuestion.correctLetter}
          </div>
          <div className="text-2xl text-white">
            {correctAnswer?.text || 'Answer not found'}
          </div>
        </div>

        {/* All answer choices with correct one highlighted */}
        <div className="grid grid-cols-2 gap-6">
          {currentQuestion.answers.map((answer) => {
            const isCorrect = answer.letter === currentQuestion.correctLetter;
            return (
              <div
                key={answer.letter}
                className={`rounded-lg p-8 text-center transition-all ${
                  isCorrect
                    ? 'bg-green-500 scale-105 ring-4 ring-green-300'
                    : 'bg-white bg-opacity-20'
                }`}
              >
                <div className={`text-4xl font-bold mb-2 ${isCorrect ? 'text-white' : ''}`}>
                  {answer.letter}
                </div>
                <div className={`text-2xl ${isCorrect ? 'text-white font-bold' : ''}`}>
                  {answer.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StreamAnswerView;