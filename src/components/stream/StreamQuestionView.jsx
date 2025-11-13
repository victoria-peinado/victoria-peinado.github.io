import React from 'react';
import Timer from '../common/Timer';

function StreamQuestionView({ gameSession, questions }) {
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
        {/* Timer at top */}
        {gameSession.questionStartTime && (
          <div className="mb-8">
            <Timer
              startTime={gameSession.questionStartTime}
              duration={gameSession.questionDuration || 30}
            />
          </div>
        )}

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
          {currentQuestion.answers.map((answer) => (
            <div
              key={answer.letter}
              className="bg-white bg-opacity-20 rounded-lg p-8 text-center"
            >
              <div className="text-4xl font-bold mb-2">
                {answer.letter}
              </div>
              <div className="text-2xl">
                {answer.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StreamQuestionView;