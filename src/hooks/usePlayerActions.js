// src/hooks/usePlayerActions.js
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
// UPDATED: Import from new service
import { submitAnswer } from '../services/player/playerGameplay';

export function usePlayerActions(gameId, playerId, gameSession, handleMessage) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to check for existing answer when question changes
  useEffect(() => {
    // Only run if the state is 'questionactive'
    if (gameSession?.state !== 'questionactive' || !playerId || !gameId) {
      return;
    }
    
    // Check for existing answer
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

    checkAnswer();
  
  }, [gameSession?.currentQuestionIndex, gameSession?.state, playerId, gameId]);

  const handleAnswerSubmit = async (answerObj) => {
    if (hasAnswered || isSubmitting) {
      console.log("Already answered or submitting, ignoring click");
      return;
    }

    setIsSubmitting(true);
    setSelectedAnswer(answerObj.letter);
    console.log("Answer submitted:", answerObj.letter);

    try {
      // UPDATED: Using new service
      await submitAnswer({
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
      handleMessage(error.message, 'error'); // Use parent's message handler
      setSelectedAnswer(null);
      setHasAnswered(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { selectedAnswer, hasAnswered, isSubmitting, handleAnswerSubmit };
}