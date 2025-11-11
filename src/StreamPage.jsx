import React from 'react';
import { useActiveGameSession } from './hooks/useActiveGameSession';
import { questionBank } from './questionBank';

export default function StreamPage() {
  const { gameSession, loading, error } = useActiveGameSession();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-pulse"></div>
          <h1 className="text-4xl font-bold">Loading game...</h1>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6"></div>
          <h1 className="text-4xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-xl text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  // No active game
  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white p-8 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <div className="text-9xl mb-8 animate-bounce"></div>
          <h1 className="text-6xl font-bold text-purple-400 mb-6">
            Waiting for Game
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            The host will start the game soon!
          </p>
          <div className="text-gray-500 text-sm">
            Game ID: None
          </div>
        </div>
      </div>
    );
  }

  // Game exists - render based on state
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 text-white">
      {renderGameState(gameSession)}
    </div>
  );
}

// Helper function to render different states
function renderGameState(gameSession) {
  switch (gameSession.state) {
    case 'waiting':
      return <WaitingView gameSession={gameSession} />;
    
    case 'questionactive':
      return <QuestionActiveView gameSession={gameSession} />;
    
    case 'answerrevealed':  // NEW
      return <AnswerRevealView gameSession={gameSession} />;
    
    case 'leaderboard':
      return <LeaderboardView gameSession={gameSession} />;
    
    default:
      return <WaitingView gameSession={gameSession} />;
  }
}
// Waiting View Component
function WaitingView({ gameSession }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="text-9xl mb-8"></div>
        <h1 className="text-7xl font-bold mb-6">Get Ready!</h1>
        <p className="text-3xl text-gray-300 mb-12">
          The next question is coming soon...
        </p>
        
        {/* QR Code Placeholder */}
        <div className="bg-white p-8 rounded-2xl mx-auto w-64 h-64 flex items-center justify-center mb-8">
          <div className="text-gray-800 text-center">
            <p className="text-sm font-bold mb-2">Scan to Join</p>
            <p className="text-xs">QR Code Here</p>
            <p className="text-xs text-gray-500 mt-2">
              Or go to:<br/>
              magic-trivia.org
            </p>
          </div>
        </div>

        <div className="text-gray-400 text-sm">
          Game ID: {gameSession.id.slice(0, 8)}...
        </div>
      </div>
    </div>
  );
}

// Question Active View Component
function QuestionActiveView({ gameSession }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="text-2xl text-purple-400 mb-4">
            Question {gameSession.currentQuestionIndex}
          </div>
          <h1 className="text-6xl font-bold mb-8">
            Question Text Will Appear Here
          </h1>
        </div>

        {/* Answer choices placeholder */}
        <div className="grid grid-cols-2 gap-6">
          {['A', 'B', 'C', 'D'].map((letter) => (
            <div
              key={letter}
              className="bg-gray-800 border-4 border-gray-600 rounded-2xl p-8 text-center"
            >
              <div className="text-3xl font-bold mb-2">{letter}</div>
              <div className="text-xl text-gray-300">Answer {letter}</div>
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

function AnswerRevealView({ gameSession }) {
  const currentQuestion = questionBank[gameSession.currentQuestionIndex];

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

  const correctAnswer = currentQuestion.answers.find(a => a.correct);

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
          {currentQuestion.answers.map((answer) => (
            <div
              key={answer.letter}
              className={`
                rounded-2xl p-8 text-center border-4 transition-all
                ${answer.correct 
                  ? 'bg-green-700 border-green-400 animate-pulse' 
                  : 'bg-gray-800 border-gray-600 opacity-50'
                }
              `}
            >
              <div className="text-3xl font-bold mb-3">
                {answer.letter} {answer.correct && '✓'}
              </div>
              <div className="text-xl text-gray-100">{answer.text}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="text-3xl font-bold text-green-400 mb-2">
            Correct Answer: {correctAnswer.letter}
          </div>
          <div className="text-xl text-gray-300">
            {correctAnswer.text}
          </div>
        </div>
      </div>
    </div>
  );
}

// Leaderboard View Component
function LeaderboardView({ gameSession }) {
  const mockPlayers = [
    { nickname: 'Player 1', score: 850 },
    { nickname: 'Player 2', score: 720 },
    { nickname: 'Player 3', score: 680 },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="text-8xl mb-6"></div>
          <h1 className="text-7xl font-bold mb-4">Leaderboard</h1>
        </div>

        <div className="space-y-4">
          {mockPlayers.map((player, index) => (
            <div
              key={index}
              className={`
                flex items-center justify-between p-6 rounded-xl
                ${index === 0 ? 'bg-yellow-600 text-white' : 
                  index === 1 ? 'bg-gray-600 text-white' : 
                  index === 2 ? 'bg-orange-700 text-white' : 
                  'bg-gray-700 text-white'}
              `}
            >
              <div className="flex items-center gap-6">
                <div className="text-5xl font-bold w-16">
                  {index === 0 ? '' : index === 1 ? '' : index === 2 ? '' : `#${index + 1}`}
                </div>
                <div className="text-3xl font-bold">{player.nickname}</div>
              </div>
              <div className="text-4xl font-bold">{player.score}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-gray-400 text-sm">
          Game ID: {gameSession.id.slice(0, 8)}...
        </div>
      </div>
    </div>
  );
}