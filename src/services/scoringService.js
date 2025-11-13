import { collection, doc, getDocs, query, where, writeBatch, increment } from 'firebase/firestore';
import { db } from '../firebase';
// No longer import ADMIN_USER_ID

/**
 * Calculate and update scores for all players who answered the current question
 * @param {string} gameId - The current game session ID
 * @param {number} questionIndex - The current question index
 * @returns {Promise<number>} - Number of players who scored points
 */
export async function calculateAndUpdateScores(gameId, questionIndex) {
  try {
    // Step 1: Get all answers for current question
    // NEW PATH
    const answersRef = collection(db, `gameSessions/${gameId}/answers`);
    const answersQuery = query(answersRef, where('questionIndex', '==', questionIndex));
    const answersSnapshot = await getDocs(answersQuery);

    // Step 2: Filter correct answers and collect timing data
    const correctAnswers = [];
    answersSnapshot.forEach((doc) => {
      const answerData = doc.data();
      if (answerData.correct) {
        correctAnswers.push({
          playerId: answerData.playerId,
          submittedAt: answerData.submittedAt?.toMillis() || 0
        });
      }
    });

    console.log(`Found ${correctAnswers.length} correct answers for question ${questionIndex}`);

    // If no correct answers, nothing to do
    if (correctAnswers.length === 0) {
      return 0;
    }

    // Step 3: Find fastest and slowest times for speed bonus calculation
    const times = correctAnswers.map(a => a.submittedAt);
    const fastestTime = Math.min(...times);
    const slowestTime = Math.max(...times);
    const timeRange = slowestTime - fastestTime || 1; // Avoid division by zero

    // Step 4: Calculate points for each player and batch update
    const batch = writeBatch(db);
    
    correctAnswers.forEach((answer) => {
      // Calculate speed bonus (0 to 40 points based on relative speed)
      const speedRatio = (slowestTime - answer.submittedAt) / timeRange;
      const speedBonus = Math.round(speedRatio * 40);
      const pointsEarned = 100 + speedBonus;

      console.log(`Player ${answer.playerId}: ${pointsEarned} points (base: 100, speed bonus: ${speedBonus})`);

      // Update player's total score
      // NEW PATH
      const playerRef = doc(db, `gameSessions/${gameId}/players/${answer.playerId}`);
      batch.update(playerRef, {
        score: increment(pointsEarned)
      });
    });

    // Step 5: Commit all score updates atomically
    await batch.commit();
    console.log(`Successfully updated scores for ${correctAnswers.length} players`);

    return correctAnswers.length;

  } catch (error) {
    console.error('Error calculating scores:', error);
    throw error;
  }
}

/**
 * Get scoring breakdown for display/debugging
 * @param {Array} times - Array of submission timestamps
 * @returns {Object} - Scoring statistics
 */
export function getScoringStats(times) {
  if (times.length === 0) return null;
  
  const fastestTime = Math.min(...times);
  const slowestTime = Math.max(...times);
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  
  return {
    fastestTime,
    slowestTime,
    avgTime,
    timeRange: slowestTime - fastestTime,
    totalPlayers: times.length
  };
}