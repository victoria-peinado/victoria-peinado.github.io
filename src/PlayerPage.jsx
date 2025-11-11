import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useActiveGameSession } from './hooks/useActiveGameSession';
import { ADMIN_USER_ID } from './config';
import { questionBank } from './questionBank';

export default function PlayerPage() {
  const [playerId, setPlayerId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { gameSession, loading: gameLoading } = useActiveGameSession();

  // Check localStorage for existing player on mount
  useEffect(() => {
    const savedPlayerId = localStorage.getItem('triviaPlayerId');
    const savedNickname = localStorage.getItem('triviaNickname');
    
    if (savedPlayerId && savedNickname) {
      console.log("Found existing player:", savedNickname);
      setPlayerId(savedPlayerId);
    }
  }, []);

  // Handle joining the game
  const handleJoinGame = async () => {
    if (!nickname.trim()) {
      setMessage({ text: 'Please enter a nickname!', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 2000);
      return;
    }

    if (!gameSession) {
      setMessage({ text: 'No active game! Ask the host to create one.', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }

    setIsJoining(true);

    try {
      // Step 1: Sign in anonymously to get a Firebase UID
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      console.log("Signed in anonymously with UID:", uid);

      // Step 2: Create player document in Firestore
      const playerRef = doc(
        db,
        `users/${ADMIN_USER_ID}/gameSessions/${gameSession.id}/players/${uid}`
      );

      await setDoc(playerRef, {
        nickname: nickname.trim(),
        score: 0,
        joinedAt: serverTimestamp()
      });

      console.log("Player document created");

      // Step 3: Save to localStorage for persistence
      localStorage.setItem('triviaPlayerId', uid);
      localStorage.setItem('triviaNickname', nickname.trim());

      // Step 4: Update state
      setPlayerId(uid);
      setMessage({ text: `Welcome, ${nickname}!`, type: 'success' });

    } catch (error) {
      console.error("Error joining game:", error);
      setMessage({ text: 'Error joining game. Try again!', type: 'error' });
    } finally {
      setIsJoining(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // If player hasn't joined yet, show join form
  if (!playerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-blue-900 text-white p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
            <div className="text-center mb-8">
              <div className="text-7xl mb-4"></div>
              <h1 className="text-4xl font-bold mb-2">Join the Game!</h1>
              <p className="text-gray-300">Enter your nickname to play</p>
            </div>

            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
              placeholder="Your Nickname"
              className="w-full p-4 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-xl"
              maxLength={20}
              disabled={isJoining}
            />

            <button
              onClick={handleJoinGame}
              disabled={isJoining || gameLoading}
              className={`w-full font-bold p-4 rounded-lg shadow-lg transition-all text-xl ${
                isJoining || gameLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 hover:scale-105'
              }`}
            >
              {isJoining ? '⏳ Joining...' : 'Join Game'}
            </button>

            {message.text && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {message.text}
              </div>
            )}

            {!gameSession && !gameLoading && (
              <div className="mt-6 p-4 bg-yellow-900 border border-yellow-600 rounded-lg text-center">
                <p className="text-sm">No active game right now</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Player has joined - show the game view
  return <PlayerGameView playerId={playerId} gameSession={gameSession} />;
}

// Component shown after player has joined
function PlayerGameView({ playerId, gameSession }) {
  const savedNickname = localStorage.getItem('triviaNickname');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset answer state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
  }, [gameSession?.currentQuestionIndex]);

  const handleAnswerSubmit = async (answerLetter) => {
    if (hasAnswered || isSubmitting) return;

    setIsSubmitting(true);
    setSelectedAnswer(answerLetter);

    try {
      // Get the current question
      const currentQuestion = questionBank[gameSession.currentQuestionIndex];
      const selectedAnswerObj = currentQuestion.answers.find(a => a.letter === answerLetter);

      // Write answer to Firestore
      const answerRef = doc(
        db,
        `users/${ADMIN_USER_ID}/gameSessions/${gameSession.id}/answers/${playerId}_q${gameSession.currentQuestionIndex}`
      );

      await setDoc(answerRef, {
        playerId: playerId,
        questionIndex: gameSession.currentQuestionIndex,
        answer: answerLetter,
        correct: selectedAnswerObj.correct,
        submittedAt: serverTimestamp()
      });

      console.log("Answer submitted:", answerLetter);
      setHasAnswered(true);

    } catch (error) {
      console.error("Error submitting answer:", error);
      setSelectedAnswer(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6"></div>
          <h1 className="text-4xl font-bold mb-4">Waiting for Game...</h1>
          <p className="text-xl text-gray-300">Welcome, {savedNickname}!</p>
        </div>
      </div>
    );
  }

  // Show different views based on game state
  switch (gameSession.state) {
    case 'waiting':
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 text-white p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-9xl mb-8"></div>
            <h1 className="text-5xl font-bold mb-4">Get Ready, {savedNickname}!</h1>
            <p className="text-2xl text-gray-300">The next question is coming soon...</p>
          </div>
        </div>
      );

    case 'questionactive':
      const currentQuestion = questionBank[gameSession.currentQuestionIndex];

      if (!currentQuestion) {
        return (
          <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold">No more questions!</h1>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-red-900 text-white p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Question {gameSession.currentQuestionIndex + 1}
              </h2>
              <p className="text-xl text-gray-300 mb-6">{currentQuestion.question}</p>
              {hasAnswered && (
                <div className="bg-green-600 text-white p-3 rounded-lg mb-4">
                   Answer submitted: {selectedAnswer}
                </div>
              )}
            </div>

            {/* Answer buttons */}
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.answers.map((answer) => (
                <button
                  key={answer.letter}
                  onClick={() => handleAnswerSubmit(answer.letter)}
                  disabled={hasAnswered || isSubmitting}
                  className={`
                    p-6 text-left rounded-xl border-2 transition-all font-semibold
                    ${hasAnswered && selectedAnswer === answer.letter
                      ? 'bg-green-700 border-green-500'
                      : hasAnswered
                      ? 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed'
                      : 'bg-gray-800 border-gray-600 hover:bg-blue-700 hover:border-blue-500 cursor-pointer'
                    }
                  `}
                >
                  <div className="text-2xl">{answer.letter}. {answer.text}</div>
                </button>
              ))}
            </div>

            {isSubmitting && (
              <div className="text-center mt-6 text-gray-400">
                Submitting...
              </div>
            )}
          </div>
        </div>
      );

    case 'answerrevealed':
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

            {/* Show all answers with correct one highlighted */}
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

    case 'leaderboard':
      return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-gray-900 to-orange-900 text-white p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6"></div>
            <h1 className="text-5xl font-bold mb-4">Leaderboard</h1>
            <p className="text-2xl text-gray-300">Check the big screen!</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Waiting...</h1>
          </div>
        </div>
      );
  }
}