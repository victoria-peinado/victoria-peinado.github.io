// src/services/game/gameState.js
import { db } from '../../firebase';
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { calculateAndUpdateScores } from '../scoringService';
// SPRINT 14: Import the new profile service function
import { updateProfileStats } from '../player/profileService';

/**
 * Updates the game state to show the next question with timer from CSV.
 * @param {string} gameId - The game session ID
 * @param {number} currentQuestionIndex - Current question index
 * @param {string} currentState - Current game state
 * @param {Array} questions - Array of questions to get duration
 */
export const showQuestion = async (
  gameId,
  currentQuestionIndex,
  currentState,
  questions
) => {
  if (!gameId) throw new Error('No game ID provided.');

  try {
    const gameRef = doc(db, 'gameSessions', gameId);

    // Determine new question index
    let newIndex = currentQuestionIndex;
    if (
      currentState === 'waiting' ||
      currentState === 'answerrevealed' ||
      currentState === 'leaderboard'
    ) {
      newIndex = currentState === 'waiting' ? 0 : currentQuestionIndex + 1;
    }

    // Get duration from the question (default to 30 if not found)
    const questionDuration = questions?.[newIndex]?.duration || 30;

    const updates = {
      state: 'questionactive',
      questionStartTime: serverTimestamp(),
      questionDuration: questionDuration, // Use duration from CSV
      updatedAt: serverTimestamp(),
    };

    // Only update currentQuestionIndex if it's changing
    if (newIndex !== currentQuestionIndex) {
      updates.currentQuestionIndex = newIndex;
    }

    await updateDoc(gameRef, updates);
    console.log(`Question ${newIndex} shown with ${questionDuration}s timer`);
    return newIndex;
  } catch (error) {
    console.error('Error showing question:', error);
    throw new Error('Failed to show question.');
  }
};

/**
 * Calculates scores and reveals the answer.
 * @param {string} gameId - The game session ID
 *s * @param {number} currentQuestionIndex - Current question index
 */
export const revealAnswer = async (gameId, currentQuestionIndex) => {
  if (!gameId) throw new Error('No game ID provided.');

  try {
    // Get game session to retrieve timer data
    const gameRef = doc(db, 'gameSessions', gameId);
    const gameSnap = await getDoc(gameRef);

    if (!gameSnap.exists()) {
      throw new Error('Game session not found');
    }

    const gameData = gameSnap.data();

    // Calculate scores with time cutoff
    const scoredPlayers = await calculateAndUpdateScores(
      gameId,
      currentQuestionIndex,
      gameData.questionStartTime,
      gameData.questionDuration || 30
    );

    // Update game state
    await updateDoc(gameRef, {
      state: 'answerrevealed',
      updatedAt: serverTimestamp(),
    });

    console.log(`Revealed answer, scored ${scoredPlayers} players`);
    return scoredPlayers;
  } catch (error) {
    console.error('Error revealing answer:', error);

    throw new Error('Error revealing answer.');
  }
};

/**
 * Updates the game state to show the leaderboard.
 * @param {string} gameId - The game session ID
 */
export const showLeaderboard = async (gameId) => {
  if (!gameId) throw new Error('No game ID provided.');

  try {
    const gameRef = doc(db, 'gameSessions', gameId);
    await updateDoc(gameRef, {
      state: 'leaderboard',
      updatedAt: serverTimestamp(),
    });
    console.log('Leaderboard shown');
  } catch (error) {
    console.error('Error showing leaderboard:', error);
    throw new Error('Error showing leaderboard.');
  }
};

/**
 * Ends the game, updates player profiles, and sets state to finished
 * @param {string} gameId - The game session ID
 */
export const endGame = async (gameId) => {
  if (!gameId) throw new Error('No game ID provided.');

  try {
    const gameRef = doc(db, 'gameSessions', gameId);

    // --- SPRINT 14: Get game data *before* ending ---
    const gameSnap = await getDoc(gameRef);
    if (!gameSnap.exists()) {
      throw new Error('Game session not found');
    }
    const gameData = gameSnap.data();
    const gameName = gameData.gameName || 'Trivia Game'; // Get name for match history

    // --- SPRINT 14: Call profile update service ---
    // This reads all players from the game and updates their permanent profiles
    console.log('Ending game, starting profile stat update...');
    await updateProfileStats(gameId, gameName);
    console.log('Profile stat update complete.');
    // ---

    // Now, set the game state to finished
    await updateDoc(gameRef, {
      state: 'finished',
      updatedAt: serverTimestamp(),
    });
    console.log('Game ended successfully');
  } catch (error) {
    console.error('Error ending game:', error);
    throw new Error('Failed to end game.');
  }
};