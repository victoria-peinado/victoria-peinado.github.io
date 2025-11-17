// src/services/player/profileService.js
import {
  db,
  arrayUnion,
  doc,
  getDoc,
  setDoc, // Import setDoc
  writeBatch,
  collection,
  getDocs,
  serverTimestamp,
  increment,
  query,
  where,
  limit,
  orderBy,
  startAfter,
} from '../../firebase';

/**
 * Gets a user's permanent profile from the top-level 'profiles' collection.
 * @param {string} userId - The user's auth UID.
 */
export const getProfile = async (userId) => {
  if (!userId) return null;
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    return profileSnap.exists() ? profileSnap.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Creates a new user profile document, typically on signup.
 * @param {string} userId - The user's auth UID.
 * @param {string} email - The user's email.
 * @param {string} displayName - The user's chosen display name.
 */
export const createProfile = async (userId, email, displayName) => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    // --- THIS IS THE FIX ---
    // Use setDoc with { merge: true } to *create* the doc
    // but *not* overwrite it if it somehow already exists.
    await setDoc(
      profileRef,
      {
        userId: userId,
        email: email, // Storing email for reference
        displayName: displayName,
        createdAt: serverTimestamp(),
        stats: {
          gamesPlayed: 0,
          totalQuestionsAnswered: 0,
          totalQuestionsCorrect: 0,
          totalAnswerTimeMs: 0,
        },
      },
      { merge: true } // This prevents overwriting existing data
    );
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};

/**
 * Fetches a user's match history. (Unchanged)
 * @param {string} userId - The user's auth UID.
 */
export const getMatchHistory = async (userId) => {
  try {
    const historyRef = collection(db, `profiles/${userId}/matchHistory`);
    const historySnap = await getDocs(historyRef);
    return historySnap.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Error fetching match history:', error);
    return [];
  }
};

/**
 * Called by 'endGame'. Reads all final player stats from a game session
 * and updates their permanent profiles in the 'profiles' collection.
 * @param {string} gameId - The ID of the game that just ended.
 * @param {string} gameName - The name of the game.
 */
export const updateProfileStats = async (gameId, gameName) => {
  console.log(`Starting profile stat update for game: ${gameId}`);
  try {
    const batch = writeBatch(db);
    const gameDate = serverTimestamp(); // Use one timestamp for all records

    // 1. Get all players from the game session (Unchanged)
    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    const playersSnap = await getDocs(playersRef);

    if (playersSnap.empty) {
      console.log('No players found in game session to update.');
      return;
    }

    // 2. Get the full leaderboard to determine rank (Unchanged)
    const leaderboardQuery = query(
      playersRef,
      where('score', '>', -1) // Effectively gets all players
    );
    const leaderboardSnap = await getDocs(leaderboardQuery);
    const sortedLeaderboard = leaderboardSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => b.score - a.score);

    // 3. Loop through each player, update their profile, and create a match history doc
    for (const playerDoc of playersSnap.docs) {
      const player = playerDoc.data();
      const playerId = playerDoc.id;

      if (!player.userId) {
        console.log(`Skipping player ${playerId} (no userId found).`);
        continue;
      }

      const rank =
        sortedLeaderboard.findIndex((p) => p.id === playerId) + 1;

      const avgAnswerTime =
        player.questionsCorrect > 0
          ? player.totalAnswerTimeMs / player.questionsCorrect
          : 0;

      // --- A. Create the Match History Document --- (Unchanged)
      const historyDocRef = doc(
        db,
        `profiles/${player.userId}/matchHistory/${gameId}`
      );
      const matchHistoryData = {
        gameId: gameId,
        gameName: gameName || 'Trivia Game',
        gameDate: gameDate,
        finalRank: rank,
        finalScore: player.score,
        questionsCorrect: player.questionsCorrect,
        avgAnswerTime: avgAnswerTime,
      };
      batch.set(historyDocRef, matchHistoryData);

      // --- B. Update the Main Profile Document ---
      const profileRef = doc(db, `profiles/${player.userId}`);
      const profileStatsUpdate = {
        stats: { // We must set the *whole* stats object with increments
          gamesPlayed: increment(1),
          totalQuestionsCorrect: increment(player.questionsCorrect),
          totalAnswerTimeMs: increment(player.totalAnswerTimeMs),
        }
      };
      
      // --- THIS IS THE FIX ---
      // Use batch.set with { merge: true } instead of batch.update
      // This will CREATE the profile doc if it's missing, or
      // UPDATE it if it already exists.
      batch.set(profileRef, profileStatsUpdate, { merge: true });
    }

    // 4. Commit all updates atomically (Unchanged)
    await batch.commit();
    console.log(
      `Successfully updated profiles for ${playersSnap.size} players.`
    );
  } catch (error) {
    console.error('Error updating profile stats:', error);
  }
};

// --- NEW FUNCTION FOR PLAYER PROFILE PAGE ---

/**
 * Gets a paginated list of a user's match history. (Unchanged)
 * @param {string} userId - The user's auth UID.
 * @param {number} pageSize - The number of matches to fetch (e.g., 10).
 * @param {DocumentSnapshot} [lastDoc] - The last document from the previous fetch, for pagination.
 */
export const getMatchHistoryPaginated = async (
  userId,
  pageSize = 10,
  lastDoc = null
) => {
  try {
    const historyRef = collection(db, `profiles/${userId}/matchHistory`);

    let q;
    if (lastDoc) {
      q = query(
        historyRef,
        orderBy('gameDate', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    } else {
      q = query(historyRef, orderBy('gameDate', 'desc'), limit(pageSize));
    }

    const historySnap = await getDocs(q);

    const matches = historySnap.docs.map((doc) => {
      const data = doc.data();
      if (data.gameDate && data.gameDate.toDate) {
        data.gameDate = data.gameDate.toDate().toLocaleDateString();
      }
      return data;
    });
    
    const newLastDoc = historySnap.docs[historySnap.docs.length - 1];

    return { matches, lastDoc: newLastDoc };
  } catch (error) {
    console.error('Error fetching paginated match history:', error);
    return { matches: [], lastDoc: null };
  }
};