import React from 'react';

function PlayerAnswerView({ gameSession, questions, selectedAnswer, hasAnswered }) {
  // Safety checks
  if (!gameSession || !questions || questions.length === 0) {
    return (
      <div className="text-center text-white">
        <p>Loading answer...</p>
      </div>
    );
  }

  const currentQuestion = questions[gameSession.currentQuestionIndex];
  
  // If currentQuestion is undefined (game ended or out of bounds), don't render
  if (!currentQuestion) {
    return (
      <div className="text-center text-white">
        <p className="text-xl">Waiting for results...</p>
      </div>
    );
  }

  const correctAnswer = currentQuestion.answers?.find(
    ans => ans.letter === currentQuestion.correctLetter
  );

  // Determine if player got it correct
  const isCorrect = selectedAnswer === currentQuestion.correctLetter;

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-lg p-8 mb-6 ${isCorrect ? 'bg-green-600' : 'bg-red-600'} text-white`}>
        <h2 className="text-4xl font-bold mb-4">
          {isCorrect ? '✓ Correct!' : '✗ Wrong Answer'}
        </h2>
        
        {!hasAnswered && (
          <p className="text-xl mb-4">You didn't answer in time!</p>
        )}

        <div className="bg-white bg-opacity-20 rounded p-4 mt-4">
          <p className="text-lg font-semibold mb-2">Question:</p>
          <p className="text-xl mb-4">{currentQuestion.question}</p>
          
          <p className="text-lg font-semibold mb-2">Correct Answer:</p>
          <p className="text-2xl font-bold">
            {currentQuestion.correctLetter}. {correctAnswer?.text || 'N/A'}
          </p>
        </div>

        {hasAnswered && selectedAnswer && !isCorrect && (
          <div className="mt-4 bg-white bg-opacity-10 rounded p-4">
            <p className="text-lg">Your answer: <span className="font-bold">{selectedAnswer}</span></p>
          </div>
        )}
      </div>

      <div className="text-center text-white">
        <p className="text-xl">Waiting for next question...</p>
      </div>
    </div>
  );
}

export default PlayerAnswerView;