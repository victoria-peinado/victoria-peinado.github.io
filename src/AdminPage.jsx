import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ADMIN_USER_ID } from './config';
import { useActiveGameSession } from './hooks/useActiveGameSession';

function AdminPage() {
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { gameSession, loading } = useActiveGameSession();

  // Create New Game Function
  const handleCreateNewGame = async () => {
    setIsCreatingGame(true);
    setMessage({ text: 'Creating new game...', type: 'info' });

    try {
      const gameSessionRef = doc(collection(db, `users/${ADMIN_USER_ID}/gameSessions`));
      const gameSessionId = gameSessionRef.id;

      await setDoc(gameSessionRef, {
        state: 'waiting',
        currentQuestionIndex: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const adminRef = doc(db, `users/${ADMIN_USER_ID}`);
      await setDoc(adminRef, {
        activeGameSessionId: gameSessionId,
        updatedAt: serverTimestamp()
      }, { merge: true });

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

  // Show Question Function
const handleShowQuestion = async () => {
  if (!gameSession) {
    setMessage({ text: 'No active game! Create one first.', type: 'error' });
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    return;
  }

  setMessage({ text: 'Showing question...', type: 'info' });

  try {
    const gameRef = doc(db, `users/${ADMIN_USER_ID}/gameSessions/${gameSession.id}`);
    
    // If coming from answer reveal, increment the question
    const updates = {
      state: 'questionactive',
      updatedAt: serverTimestamp()
    };

    // Only increment if we were in answerrevealed state
    if (gameSession.state === 'answerrevealed') {
      updates.currentQuestionIndex = gameSession.currentQuestionIndex + 1;
    }

    await updateDoc(gameRef, updates);

    console.log(" Question shown, index:", updates.currentQuestionIndex || gameSession.currentQuestionIndex);
    setMessage({ text: 'Question is now live!', type: 'success' });
    
  } catch (error) {
    console.error(" Error showing question:", error);
    setMessage({ text: 'Error showing question.', type: 'error' });
  } finally {
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  }
};

  // Reveal Answer Function
const handleRevealAnswer = async () => {
  if (!gameSession) {
    setMessage({ text: 'No active game!', type: 'error' });
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    return;
  }

  setMessage({ text: 'Revealing answer...', type: 'info' });

  try {
    const gameRef = doc(db, `users/${ADMIN_USER_ID}/gameSessions/${gameSession.id}`);
    
    // Change to "answerrevealed" state temporarily
    await updateDoc(gameRef, {
      state: 'answerrevealed',
      updatedAt: serverTimestamp()
    });

    console.log(" Answer revealed for question", gameSession.currentQuestionIndex);
    setMessage({ text: 'Answer revealed! Click "Show Question" for next question.', type: 'success' });
    
  } catch (error) {
    console.error(" Error revealing answer:", error);
    setMessage({ text: 'Error revealing answer.', type: 'error' });
  } finally {
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  }
};

  // Show Leaderboard Function
  const handleShowLeaderboard = async () => {
    if (!gameSession) {
      setMessage({ text: 'No active game!', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 2000);
      return;
    }

    setMessage({ text: 'Showing leaderboard...', type: 'info' });

    try {
      const gameRef = doc(db, `users/${ADMIN_USER_ID}/gameSessions/${gameSession.id}`);
      
      await updateDoc(gameRef, {
        state: 'leaderboard',
        updatedAt: serverTimestamp()
      });

      console.log(" Leaderboard shown");
      setMessage({ text: 'Leaderboard is now visible!', type: 'success' });
      
    } catch (error) {
      console.error(" Error showing leaderboard:", error);
      setMessage({ text: 'Error showing leaderboard.', type: 'error' });
    } finally {
      setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    }
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
              disabled={isCreatingGame || loading}
              className={`${
                isCreatingGame || loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              } text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl`}
            >
              {isCreatingGame ? ' Creating...' : ' Create New Game'}
            </button>

            {/* Show Question Button */}
            <button
              onClick={handleShowQuestion}
              disabled={!gameSession || loading}
              className={`${
                !gameSession || loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl`}
            >
               Show Question
            </button>

            {/* Reveal Answer Button */}
            <button
              onClick={handleRevealAnswer}
              disabled={!gameSession || loading}
              className={`${
                !gameSession || loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              } text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl`}
            >
               Reveal Answer
            </button>

            {/* Show Leaderboard Button */}
            <button
              onClick={handleShowLeaderboard}
              disabled={!gameSession || loading}
              className={`${
                !gameSession || loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'
              } text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 text-xl`}
            >
               Show Leaderboard
            </button>
          </div>

          {/* Current Game Status */}
          <div className="mt-8 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-xl font-semibold mb-2">Current Game Status</h3>
            {loading ? (
              <p className="text-gray-300">Loading...</p>
            ) : gameSession ? (
              <>
                <p className="text-gray-300">
                  Game State: <span className="text-green-400 font-bold uppercase">{gameSession.state}</span>
                </p>
                <p className="text-gray-300">
                  Current Question: <span className="text-blue-400 font-bold">{gameSession.currentQuestionIndex}</span>
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Game ID: {gameSession.id.slice(0, 12)}...
                </p>
              </>
            ) : (
              <p className="text-gray-400">No active game</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;