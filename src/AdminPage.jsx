import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ADMIN_USER_ID } from './config';

function AdminPage() {
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Create New Game Function
  const handleCreateNewGame = async () => {
    setIsCreatingGame(true);
    setMessage({ text: 'Creating new game...', type: 'info' });

    try {
      // 1. Create a new game session ID
      const gameSessionRef = doc(collection(db, `users/${ADMIN_USER_ID}/gameSessions`));
      const gameSessionId = gameSessionRef.id;

      // 2. Create the game session document with default data
      await setDoc(gameSessionRef, {
        state: 'waiting',  // Game states: waiting, questionactive, leaderboard
        currentQuestionIndex: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 3. Update admin user document to point to this active game
      const adminRef = doc(db, `users/${ADMIN_USER_ID}`);
      await setDoc(adminRef, {
        activeGameSessionId: gameSessionId,
        updatedAt: serverTimestamp()
      }, { merge: true });  // merge: true preserves other fields like subscriptionTier

      console.log(" Game created successfully:", gameSessionId);
      setMessage({ text: 'Game created successfully!', type: 'success' });
      
    } catch (error) {
      console.error(" Error creating game:", error);
      setMessage({ text: 'Error creating game. Check console.', type: 'error' });
    } finally {
      setIsCreatingGame(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Placeholder functions for other buttons
  const handleShowQuestion = () => {
    console.log("Show Question - Coming in Phase 4");
    setMessage({ text: 'Show Question - Coming soon!', type: 'info' });
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  };

  const handleRevealAnswer = () => {
    console.log("Reveal Answer - Coming in Phase 4");
    setMessage({ text: 'Reveal Answer - Coming soon!', type: 'info' });
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  };

  const handleShowLeaderboard = () => {
    console.log("Show Leaderboard - Coming in Phase 4");
    setMessage({ text: 'Show Leaderboard - Coming soon!', type: 'info' });
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
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

      {/* Status Message */}
      {message.text && (
        <div className={`max-w-4xl mx-auto mb-4 p-4 rounded-lg text-center font-semibold ${
          message.type === 'success' ? 'bg-green-600' :
          message.type === 'error' ? 'bg-red-600' :
          'bg-blue-600'
        }`}>
          {message.text}
        </div>
      )}

      <main className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-center">Game Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create New Game Button */}
            <button
              onClick={handleCreateNewGame}
              disabled={isCreatingGame}
              className={`${
                isCreatingGame ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              } text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl`}
            >
              {isCreatingGame ? ' Creating...' : ' Create New Game'}
            </button>

            <button
              onClick={handleShowQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl"
            >
               Show Question
            </button>

            <button
              onClick={handleRevealAnswer}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl"
            >
               Reveal Answer
            </button>

            <button
              onClick={handleShowLeaderboard}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl"
            >
               Show Leaderboard
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-xl font-semibold mb-2">Current Status</h3>
            <p className="text-gray-300">
              Game State: <span className="text-green-400 font-bold">Ready</span>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Admin ID: {ADMIN_USER_ID.slice(0, 8)}...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;