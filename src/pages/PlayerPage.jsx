import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useGameSession } from '../hooks/useGameSession';
import { useAuth } from '../contexts/AuthContext';
import * as playerService from '../services/playerService';
import { db } from '../firebase'; // <-- ADDED for re-answer check
import { collection, query, where, getDocs } from 'firebase/firestore'; // <-- ADDED for re-answer check

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

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset answer state when question index changes
  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);

    // --- BRAINSTORM FIX ---
    // Check if player has already answered this question on reload
    if (gameSession?.state === 'questionactive' && playerId && gameId) {
      const checkAnswer = async () => {
        try {
          const q = query(
            collection(db, `gameSessions/${gameId}/answers`),
            where('playerId', '==', playerId),
            where('questionIndex', '==', gameSession.currentQuestionIndex)
          );
          
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            console.log("Player has already answered this question.");
            setHasAnswered(true);
            // Optionally, set their previous answer to display it
            const existingAnswerLetter = snapshot.docs[0].data().answerLetter;
            setSelectedAnswer(existingAnswerLetter);
          }
        } catch (error) {
          console.error("Error checking existing answer:", error);
        }
      };
      checkAnswer();
    }
    // --- END FIX ---

  }, [gameSession?.currentQuestionIndex, gameSession?.state, playerId, gameId]);

  // Check localStorage for existing player
  useEffect(() => {
    if (authLoading || gameLoading || !gameSession || !currentUser) return;

    const savedPlayerId = localStorage.getItem('triviaPlayerId');
    const savedGameId = localStorage.getItem('triviaGameId');
    
    if (savedPlayerId === currentUser.uid && savedGameId === gameSession.id) {
      console.log("✅ Found existing player for THIS game:", savedPlayerId);
      setPlayerId(savedPlayerId);
    } else if (savedPlayerId) {
      console.log("🧹 Clearing player from old game...");
      localStorage.removeItem('triviaPlayerId');
      localStorage.removeItem('triviaNickname');
      localStorage.removeItem('triviaGameId');
    }
  }, [gameSession, gameLoading, currentUser, authLoading]);

  // Auto-join if nickname was passed (this logic might be removed if PIN is only entry)
  useEffect(() => {
    if (location.state?.nickname && !playerId && gameSession && !isJoining && currentUser) {
      handleJoinGame();
    }
  }, [location.state?.nickname, playerId, gameSession, isJoining, currentUser]);

  const handleMessage = (text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const handleJoinGame = async () => {
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
    if (hasAnswered || isSubmitting) return;

    setIsSubmitting(true);
    setSelectedAnswer(answerObj.letter);

    try {
      await playerService.submitAnswer({
        gameId: gameSession.id,
        playerId: playerId,
        questionIndex: gameSession.currentQuestionIndex,
        answerLetter: answerObj.letter,
        isCorrect: answerObj.correct,
      });
      setHasAnswered(true);
    } catch (error)
    {
      handleMessage(error.message, 'error');
      setSelectedAnswer(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER LOGIC ---

  if (authLoading || gameLoading) {
    return <LoadingScreen message="Loading player..." />;
  }

  if (!currentUser) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  if (!gameId || gameError) {
    return <ErrorScreen error="This game does not exist or is invalid." />;
  }

  if (!playerId) {
    return (
      <PlayerJoinForm
        nickname={nickname}
        setNickname={setNickname}
        handleJoinGame={handleJoinGame}
        isJoining={isJoining}
        gameLoading={gameLoading}
        gameSession={gameSession}
        message={message}
      />
    );
  }

  if (!gameSession) {
    const savedNickname = localStorage.getItem('triviaNickname');
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

  switch (gameSession.state) {
    case 'waiting':
      return <PlayerWaitingView />;
    
    case 'questionactive':
      return (
        <PlayerQuestionView
          gameSession={gameSession}
          handleAnswerSubmit={handleAnswerSubmit}
          hasAnswered={hasAnswered}
          isSubmitting={isSubmitting}
          selectedAnswer={selectedAnswer}
        />
      );

    case 'answerrevealed':
      return (
        <PlayerAnswerView
          gameSession={gameSession}
          selectedAnswer={selectedAnswer}
        />
      );

    case 'leaderboard':
      return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-gray-900 to-orange-900 text-white p-8">
          <Leaderboard gameId={gameId} />
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