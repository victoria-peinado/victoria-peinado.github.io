// src/components/player/PlayerAnswerView.jsx
import React from 'react';
import { questionBank } from '../../questionBank'; // Note: path is updated

function PlayerAnswerView({ gameSession, selectedAnswer }) {
  const revealQuestion = questionBank[gameSession.currentQuestionIndex];
      
  if (!revealQuestion) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Game Complete!</h1>
        </div>
      </div>
    );
  }

  const correctAnswer = revealQuestion.answers.find(a => a.correct);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-blue-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">
            {selectedAnswer === correctAnswer.letter ? '' : ''}
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {selectedAnswer === correctAnswer.letter ? 'Correct!' : 'Wrong Answer'}
          </h2>
          <p className="text-xl text-gray-300 mb-6">{revealQuestion.question}</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {revealQuestion.answers.map((answer) => (
            <div
              key={answer.letter}
              className={`
                p-6 rounded-xl border-2 transition-all
                ${answer.correct
                  ? 'bg-green-700 border-green-400'
                  : answer.letter === selectedAnswer
                  ? 'bg-red-700 border-red-400'
                  : 'bg-gray-800 border-gray-600 opacity-60'
                }
              `}
            >
              <div className="text-2xl font-semibold">
                {answer.letter}. {answer.text}
                {answer.correct && ' ✓'}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 text-2xl font-bold text-green-400">
          Correct Answer: {correctAnswer.letter}
        </div>
      </div>
    </div>
  );
}

export default PlayerAnswerView;