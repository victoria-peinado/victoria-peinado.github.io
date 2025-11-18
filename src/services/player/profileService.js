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
        stats: {
          // We must set the *whole* stats object with increments
          gamesPlayed: increment(1),
          totalQuestionsCorrect: increment(player.questionsCorrect),
          totalAnswerTimeMs: increment(player.totalAnswerTimeMs),
        }
      };
      
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

// --- SPRINT 16: NEW FUNCTION ---
/**
 * Migrates a single anonymous player's game stats to a newly registered user profile.
 * This is called immediately after a user signs up.
 * @param {string} anonId - The anonymous player's UID/ID (used in game session).
 * @param {string} newUserUid - The new permanent UID of the registered user.
 * @param {string} gameId - The ID of the game that was just played.
 */
export const migrateAnonymousStats = async (anonId, newUserUid, gameId) => {
  console.log(`Starting migration for anonId: ${anonId} to UID: ${newUserUid}`);
  try {
    const batch = writeBatch(db);
    const gameDate = serverTimestamp();

    // 1. Get the Anonymous Player's final stats
    const playerRef = doc(db, `gameSessions/${gameId}/players/${anonId}`);
    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) {
      console.warn(`Anonymous player ${anonId} not found for migration.`);
      return;
    }
    const player = playerSnap.data();

    // 2. Get the game session name (required for match history)
    const gameRef = doc(db, 'gameSessions', gameId);
    const gameSnap = await getDoc(gameRef);
    const gameName = gameSnap.data()?.gameName || 'Trivia Game';

    // 3. Determine final rank by checking all players in the session
    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    const leaderboardQuery = query(
      playersRef,
      where('score', '>', -1) // Fetch all players
    );
    const leaderboardSnap = await getDocs(leaderboardQuery);
    const sortedLeaderboard = leaderboardSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.score - a.score);
    const rank = sortedLeaderboard.findIndex((p) => p.id === anonId) + 1; // Find the anon player's rank

    // 4. Calculate final stats
    const avgAnswerTime =
      player.questionsCorrect > 0
        ? player.totalAnswerTimeMs / player.questionsCorrect
        : 0;

    // 5. Update Match History (Targetting the new user's profile)
    const historyDocRef = doc(
      db,
      `profiles/${newUserUid}/matchHistory/${gameId}`
    );
    batch.set(historyDocRef, {
      gameId: gameId,
      gameName: gameName,
      gameDate: gameDate,
      finalRank: rank,
      finalScore: player.score,
      questionsCorrect: player.questionsCorrect,
      avgAnswerTime: avgAnswerTime,
    });

    // 6. Update Main Profile Stats (Targetting the new user's profile)
    const profileRef = doc(db, `profiles/${newUserUid}`);
    const profileStatsUpdate = {
      stats: {
        gamesPlayed: increment(1),
        totalQuestionsCorrect: increment(player.questionsCorrect),
        totalAnswerTimeMs: increment(player.totalAnswerTimeMs),
      },
    };
    batch.set(profileRef, profileStatsUpdate, { merge: true }); // Use set/merge to ensure the doc exists or is updated

    // 7. Commit
    await batch.commit();
    console.log(
      `Successfully migrated stats for anonymous user ${anonId} to profile ${newUserUid}`
    );
  } catch (error) {
    console.error('Error migrating anonymous stats:', error);
  }
};
// --- END SPRINT 16 ---

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