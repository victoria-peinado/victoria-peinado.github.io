import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useGameSession } from '../hooks/useGameSession';
import { useQuestionBank } from '../hooks/useQuestionBank';
import { useAuth } from '../contexts/AuthContext';
import * as playerService from '../services/playerService';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import PlayerJoinForm from '../components/player/PlayerJoinForm';
import PlayerWaitingView from '../components/player/PlayerWaitingView';
import PlayerQuestionView from '../components/player/PlayerQuestionView';
import PlayerAnswerView from '../components/player/PlayerAnswerView';
import Leaderboard from '../components/common/Leaderboard';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';

export default function PlayerPage() {
  const { gameId } = useParams();
  const { currentUser, loading: authLoading } = useAuth();
  const location = useLocation();
  const [playerId, setPlayerId] = useState(null);
  const [nickname, setNickname] = useState(location.state?.nickname || '');
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { gameSession, loading: gameLoading, error: gameError } = useGameSession(gameId);
  const { questions } = useQuestionBank(gameSession?.questionBankId);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset answer state when question changes
  useEffect(() => {
    console.log("Question changed or state updated:", gameSession?.state, "Question:", gameSession?.currentQuestionIndex);
    
    // Only reset if we're on a NEW question (questionactive state)
    if (gameSession?.state === 'questionactive') {
      const checkAnswer = async () => {
        try {
          const q = query(
            collection(db, `gameSessions/${gameId}/answers`),
            where('playerId', '==', playerId),
            where('questionIndex', '==', gameSession.currentQuestionIndex)
          );
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            console.log("Player already answered this question");
            const existingAnswer = snapshot.docs[0].data();
            setSelectedAnswer(existingAnswer.answer);
            setHasAnswered(true);
          } else {
            console.log("No answer found, resetting states");
            setSelectedAnswer(null);
            setHasAnswered(false);
          }
        } catch (error) {
          console.error("Error checking existing answer:", error);
        }
      };

      if (playerId && gameId) {
        checkAnswer();
      }
    }
    // Don't reset states if we're in answerrevealed or other states
  }, [gameSession?.currentQuestionIndex, gameSession?.state, playerId, gameId]);

  // Check localStorage ONLY for this specific game
  useEffect(() => {
    if (authLoading || gameLoading || !gameSession || !currentUser) return;

    const checkExistingPlayer = async () => {
      const savedPlayerId = localStorage.getItem('triviaPlayerId');
      const savedGameId = localStorage.getItem('triviaGameId');
      const savedNickname = localStorage.getItem('triviaNickname');

      // If saved game ID doesn't match current game, clear and exit
      if (savedGameId !== gameId) {
        console.log("Different game detected, clearing old player data");
        localStorage.removeItem('triviaPlayerId');
        localStorage.removeItem('triviaNickname');
        localStorage.removeItem('triviaGameId');
        return;
      }

      // If everything matches, verify player actually exists in THIS game
      if (savedPlayerId === currentUser.uid && savedGameId === gameId && savedNickname) {
        try {
          const playerRef = doc(db, `gameSessions/${gameId}/players/${savedPlayerId}`);
          const playerSnap = await getDoc(playerRef);
          
          if (playerSnap.exists()) {
            console.log("Found existing player for THIS game:", savedPlayerId);
            setPlayerId(savedPlayerId);
            setNickname(savedNickname);
          } else {
            console.log("Player doc doesn't exist in THIS game, clearing localStorage");
            localStorage.removeItem('triviaPlayerId');
            localStorage.removeItem('triviaNickname');
            localStorage.removeItem('triviaGameId');
          }
        } catch (error) {
          console.error("Error verifying player:", error);
        }
      }
    };

    checkExistingPlayer();
  }, [gameSession, gameLoading, currentUser, authLoading, gameId]);

  const handleMessage = (text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      handleMessage('Please enter a nickname!', 'error', 2000);
      return;
    }

    if (!gameSession) {
      handleMessage('No active game! Ask the host to create one.', 'error');
      return;
    }

    if (!currentUser) {
      handleMessage('You must be logged in to join!', 'error');
      return;
    }

    setIsJoining(true);
    try {
      const uid = await playerService.joinGame(gameSession.id, currentUser.uid, nickname.trim());
      localStorage.setItem('triviaPlayerId', uid);
      localStorage.setItem('triviaNickname', nickname.trim());
      localStorage.setItem('triviaGameId', gameSession.id);
      setPlayerId(uid);
      handleMessage(`Welcome, ${nickname}!`, 'success');
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsJoining(false);
    }
  };

  const handleAnswerSubmit = async (answerObj) => {
    if (hasAnswered || isSubmitting) {
      console.log("Already answered or submitting, ignoring click");
      return;
    }

    setIsSubmitting(true);
    setSelectedAnswer(answerObj.letter);
    console.log("Answer submitted:", answerObj.letter);

    try {
      await playerService.submitAnswer({
        gameId: gameSession.id,
        playerId: playerId,
        questionIndex: gameSession.currentQuestionIndex,
        answerLetter: answerObj.letter,
        isCorrect: answerObj.correct,
      });
      setHasAnswered(true); // THIS MUST STAY TRUE
      console.log("Answer successfully submitted and hasAnswered set to true");
    } catch (error) {
      console.error("Error submitting answer:", error);
      handleMessage(error.message, 'error');
      setSelectedAnswer(null);
      setHasAnswered(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER LOGIC ---
  if (authLoading || gameLoading) {
    return <LoadingScreen message="Loading game..." />;
  }

  if (gameError) {
    return <ErrorScreen message={gameError} />;
  }

  if (!gameSession) {
    return <ErrorScreen message="Game session not found." />;
  }

  // Not joined yet
  if (!playerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-8">
        <div className="max-w-md mx-auto">
          {message.text && (
            <div className={`mb-4 p-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.text}
            </div>
          )}
          <PlayerJoinForm
            nickname={nickname}
            onNicknameChange={setNickname}
            onJoinGame={handleJoinGame}
            isJoining={isJoining}
          />
        </div>
      </div>
    );
  }

  // Render based on game state
  const renderGameState = () => {
    console.log("Rendering state:", gameSession.state, "hasAnswered:", hasAnswered, "selectedAnswer:", selectedAnswer);
    
    switch (gameSession.state) {
      case 'waiting':
        return <PlayerWaitingView nickname={nickname} />;
      
      case 'questionactive':
        return (
          <PlayerQuestionView
            gameSession={gameSession}
            questions={questions}
            onAnswerSelect={handleAnswerSubmit}
            hasAnswered={hasAnswered}
            isSubmitting={isSubmitting}
            selectedAnswer={selectedAnswer}
          />
        );
      
      case 'answerrevealed':
        return (
          <PlayerAnswerView
            gameSession={gameSession}
            questions={questions}
            selectedAnswer={selectedAnswer}
            hasAnswered={hasAnswered}
          />
        );
      
      case 'leaderboard':
        return (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-8">Leaderboard</h2>
            <Leaderboard gameId={gameSession.id} />
          </div>
        );
      
      case 'finished':
        return (
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
            <p className="text-2xl mb-8">Thanks for playing!</p>
            <Leaderboard gameId={gameSession.id} />
          </div>
        );
      
      default:
        return (
          <div className="text-center text-white">
            <p className="text-xl">Unknown game state: {gameSession.state}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-8">
      <div className="max-w-4xl mx-auto">
        {message.text && (
          <div className={`mb-4 p-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}
        {renderGameState()}
      </div>
    </div>
  );
}