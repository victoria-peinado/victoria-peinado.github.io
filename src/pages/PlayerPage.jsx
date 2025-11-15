// src/pages/PlayerPage.jsx
import React, { useState, useEffect, useRef } from 'react'; // <-- 1. IMPORT useRef
// --- 1. IMPORT useNavigate ---
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useGameSession } from '../hooks/useGameSession';
import { useQuestionBank } from '../hooks/useQuestionBank';
import { useAuth } from '../contexts/AuthContext';
import * as playerService from '../services/playerService';
import { db } from '../firebase';
// --- 2. IMPORT onSnapshot ---
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import PlayerJoinForm from '../components/player/PlayerJoinForm';
import PlayerWaitingView from '../components/player/PlayerWaitingView';
import PlayerQuestionView from '../components/player/PlayerQuestionView';
import PlayerAnswerView from '../components/player/PlayerAnswerView';
import Leaderboard from '../components/common/Leaderboard';
// 1. Import your FinalLeaderboard component
import FinalLeaderboard from '../components/common/FinalLeaderboard'; 
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';
import PlayerNavbar from '../components/layout/PlayerNavbar';

// --- 2. CREATE A NEW COMPONENT FOR THE MESSAGE OVERLAY ---
function AdminMessageOverlay({ message, onClose }) {
  if (!message) return null;

  const isBroadcast = message.type === 'broadcast';
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white text-gray-900 w-full max-w-md p-6 rounded-2xl shadow-2xl border-4 border-purple-500 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold mb-4">
          {isBroadcast ? 'Broadcast from Admin' : 'Direct Message'}
        </h2>
        <p className="text-gray-700 text-lg mb-6">{message.text}</p>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}


export default function PlayerPage() {
  const { gameId } = useParams();
  const { currentUser, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // <-- 3. INITIALIZE NAVIGATE
  const [playerId, setPlayerId] = useState(null);
  const [nickname, setNickname] = useState(location.state?.nickname || '');
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { gameSession, loading: gameLoading, error: gameError } = useGameSession(gameId);
  const { questions } = useQuestionBank(gameSession?.questionBankId);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 3. ADD STATE FOR ADMIN MESSAGES ---
  const [adminMessage, setAdminMessage] = useState(null); // e.g., { text: '...', type: 'broadcast' }
  const lastBroadcastTimestamp = useRef(null);
  const lastDirectMessageTimestamp = useRef(null);

  // ... (all other useEffects and handlers are unchanged) ...
  useEffect(() => {
    console.log("Question changed or state updated:", gameSession?.state, "Question:", gameSession?.currentQuestionIndex);
    
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
  }, [gameSession?.currentQuestionIndex, gameSession?.state, playerId, gameId]);

  useEffect(() => {
    if (authLoading || gameLoading || !gameSession || !currentUser) return;

    const checkExistingPlayer = async () => {
      const savedPlayerId = localStorage.getItem('triviaPlayerId');
      const savedGameId = localStorage.getItem('triviaGameId');
      const savedNickname = localStorage.getItem('triviaNickname');

      if (savedGameId !== gameId) {
        console.log("Different game detected, clearing old player data");
        localStorage.removeItem('triviaPlayerId');
        localStorage.removeItem('triviaNickname');
        localStorage.removeItem('triviaGameId');
        return;
      }

      if (savedPlayerId === currentUser.uid && savedGameId === gameId && savedNickname) {
        try {
          const playerRef = doc(db, `gameSessions/${gameId}/players/${savedPlayerId}`);
          const playerSnap = await getDoc(playerRef);
          
          if (playerSnap.exists()) {
            const playerData = playerSnap.data();
            if (playerData.hasExited === true) {
              console.log("Player has exited, clearing localStorage and blocking rejoin");
              localStorage.removeItem('triviaPlayerId');
              localStorage.removeItem('triviaNickname');
              localStorage.removeItem('triviaGameId');
              setPlayerId(null);
            } else {
              console.log("Found existing player for THIS game:", savedPlayerId);
              setPlayerId(savedPlayerId);
              setNickname(savedNickname);
            }
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

  // --- 4. UPDATE KICK/MESSAGE LISTENER ---
  useEffect(() => {
    // Only run this listener if we have a valid gameId and playerId
    if (!gameId || !playerId) return;

    const playerRef = doc(db, `gameSessions/${gameId}/players/${playerId}`);
    
    const unsubscribe = onSnapshot(playerRef, (doc) => {
      if (doc.exists()) {
        const playerData = doc.data();
        
        // --- KICK LOGIC ---
        if (playerData.isKicked === true) {
          console.log("Kicked by admin. Redirecting...");
          
          // Clear local storage so they can't rejoin
          localStorage.removeItem('triviaPlayerId');
          localStorage.removeItem('triviaNickname');
          localStorage.removeItem('triviaGameId');
          
          // Redirect to the homepage with a message
          navigate('/', { 
            state: { 
              message: "You have been kicked from the game by the admin." 
            } 
          });
          return; // Stop processing if kicked
        }
        
        // --- DIRECT MESSAGE LOGIC ---
        if (playerData.directMessage && playerData.directMessage.sentAt) {
          const newTimestamp = playerData.directMessage.sentAt?.seconds;
          // Check if it's a new message
          if (newTimestamp > (lastDirectMessageTimestamp.current || 0)) {
            console.log("New direct message received");
            setAdminMessage({
              text: playerData.directMessage.message,
              type: 'direct'
            });
            lastDirectMessageTimestamp.current = newTimestamp;
          }
        }

      } else {
        // Player document was deleted (e.g., game deleted)
        console.log("Player document not found. Redirecting...");
        navigate('/', { 
          state: { 
            message: "The game session has ended." 
          } 
        });
      }
    }, (error) => {
      console.error("Error listening to player document:", error);
    });

    // Cleanup the listener when the component unmounts or deps change
    return () => unsubscribe();

  }, [gameId, playerId, navigate]); // Add dependencies

  // --- 5. ADD NEW useEffect TO LISTEN FOR BROADCASTS ---
  useEffect(() => {
    // We get gameSession from the useGameSession hook
    if (gameSession && gameSession.broadcastMessage && gameSession.broadcastMessage.sentAt) {
      const newTimestamp = gameSession.broadcastMessage.sentAt?.seconds;
      
      // Check if it's a new message
      if (newTimestamp > (lastBroadcastTimestamp.current || 0)) {
        console.log("New broadcast message received");
        setAdminMessage({
          text: gameSession.broadcastMessage.message,
          type: 'broadcast'
        });
        lastBroadcastTimestamp.current = newTimestamp;
      }
    }
  }, [gameSession]); // This runs every time gameSession updates

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
      setHasAnswered(true); 
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
    // ... (JoinForm logic is unchanged) ...
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-8">
        <PlayerNavbar /> 
        <div className="max-w-md mx-auto mt-4">
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
      
      // 2. THIS IS THE FIX
      case 'finished':
        return (
          <div className="text-center text-white">
            {/* The FinalLeaderboard component already has all the
              "Game Over" text and podiums, so we just render it.
            */}
            <FinalLeaderboard gameId={gameSession.id} />
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

  // --- 6. UPDATE FINAL RETURN TO INCLUDE THE OVERLAY ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-8">
      {/* --- ADD THE OVERLAY --- */}
      <AdminMessageOverlay 
        message={adminMessage} 
        onClose={() => setAdminMessage(null)} 
      />
      
      <PlayerNavbar />
      <div className="max-w-4xl mx-auto mt-4">
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