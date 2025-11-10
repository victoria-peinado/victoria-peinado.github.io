import React from 'react';
import { Link } from 'react-router-dom';

function AdminPage() {
  // Placeholder functions - we'll implement these in Step 3
  const handleCreateNewGame = () => {
    console.log("Create New Game button clicked");
    // TODO: Implement in Phase 2, Step 3
  };

  const handleShowQuestion = () => {
    console.log("Show Question button clicked");
    // TODO: Implement in Phase 4, Step 1
  };

  const handleRevealAnswer = () => {
    console.log("Reveal Answer button clicked");
    // TODO: Implement in Phase 4, Step 3
  };

  const handleShowLeaderboard = () => {
    console.log("Show Leaderboard button clicked");
    // TODO: Implement in Phase 4, Step 1
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-5xl font-bold text-center text-red-400 mb-4">
           Admin Control Panel
        </h1>
        <p className="text-center text-gray-300 text-lg">
          Your remote control for managing the live trivia game
        </p>
        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Control Buttons */}
      <main className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-center">Game Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create New Game Button */}
            <button
              onClick={handleCreateNewGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl"
            >
               Create New Game
            </button>

            {/* Show Question Button */}
            <button
              onClick={handleShowQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl"
            >
               Show Question
            </button>

            {/* Reveal Answer Button */}
            <button
              onClick={handleRevealAnswer}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl"
            >
               Reveal Answer
            </button>

            {/* Show Leaderboard Button */}
            <button
              onClick={handleShowLeaderboard}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl"
            >
              Show Leaderboard
            </button>
          </div>

          {/* Status Display (Optional) */}
          <div className="mt-8 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-xl font-semibold mb-2">Current Status</h3>
            <p className="text-gray-300">
              Game State: <span className="text-green-400 font-bold">Waiting for game...</span>
            </p>
            <p className="text-gray-300">
              Players Connected: <span className="text-blue-400 font-bold">0</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;