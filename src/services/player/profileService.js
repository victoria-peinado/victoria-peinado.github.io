// src/services/player/profileService.js
import {
  db,
  doc,
  getDoc,
  setDoc,
  writeBatch,
  collection,
  getDocs,
  serverTimestamp,
  increment,
  query,
  where,
  orderBy,
  startAfter,
  limit
} from '../../firebase';

/**
 * Gets a user's permanent profile from the top-level 'profiles' collection.
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
 */
export const createProfile = async (userId, email, displayName) => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    await setDoc(
      profileRef,
      {
        userId: userId,
        email: email,
        displayName: displayName,
        createdAt: serverTimestamp(),
        stats: {
          gamesPlayed: 0,
          totalQuestionsAnswered: 0,
          totalQuestionsCorrect: 0,
          totalAnswerTimeMs: 0,
        },
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};

/**
 * Fetches a user's match history.
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
 */
export const updateProfileStats = async (gameId, gameName) => {
  console.log(`Starting profile stat update for game: ${gameId}`);
  try {
    const batch = writeBatch(db);
    const gameDate = serverTimestamp();

    // 1. Get all players from the game session
    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    const playersSnap = await getDocs(playersRef);

    if (playersSnap.empty) {
      console.log('No players found in game session to update.');
      return;
    }

    // 2. Get the full leaderboard to determine rank
    const leaderboardQuery = query(
      playersRef,
      where('score', '>', -1)
    );
    const leaderboardSnap = await getDocs(leaderboardQuery);
    const sortedLeaderboard = leaderboardSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => b.score - a.score);

    // 3. Loop through each player
    for (const playerDoc of playersSnap.docs) {
      const player = playerDoc.data();
      const playerId = playerDoc.id;

      // --- BUG FIX 1: More robust Anonymous check ---
      // Checks for boolean true, string "true", or just truthy.
      if (player.isAnonymous === true || player.isAnonymous === 'true' || player.isAnonymous) {
        console.log(`Skipping anonymous player ${playerId}.`);
        continue;
      }

      // --- BUG FIX 2: Robust userId Validation ---
      // Prevents the loop from crashing if a player has no userId or invalid userId
      if (!player.userId || typeof player.userId !== 'string') {
        console.warn(`Skipping registered player ${playerId} - Invalid or missing userId:`, player.userId);
        continue;
      }

      try {
        const rank = sortedLeaderboard.findIndex((p) => p.id === playerId) + 1;

        const avgAnswerTime =
          player.questionsCorrect > 0
            ? player.totalAnswerTimeMs / player.questionsCorrect
            : 0;

        // --- A. Create the Match History Document ---
        // Utilizing the validated player.userId
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
            gamesPlayed: increment(1),
            totalQuestionsCorrect: increment(player.questionsCorrect || 0),
            totalAnswerTimeMs: increment(player.totalAnswerTimeMs || 0),
          }
        };

        batch.set(profileRef, profileStatsUpdate, { merge: true });

      } catch (err) {
         // Catch individual errors so one bad player record doesn't fail the whole batch
         console.error(`Error processing update for player ${playerId}:`, err);
      }
    }

    // 4. Commit all updates atomically
    await batch.commit();
    console.log(
      `Successfully updated profiles for valid registered players.`
    );
  } catch (error) {
    console.error('Error updating profile stats (Batch Failed):', error);
  }
};

/**
 * Migrates a single anonymous player's game stats to a newly registered user profile.
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

    // 2. Get the game session name
    const gameRef = doc(db, 'gameSessions', gameId);
    const gameSnap = await getDoc(gameRef);
    const gameName = gameSnap.data()?.gameName || 'Trivia Game';

    // 3. Determine final rank
    const playersRef = collection(db, `gameSessions/${gameId}/players`);
    const leaderboardQuery = query(
      playersRef,
      where('score', '>', -1)
    );
    const leaderboardSnap = await getDocs(leaderboardQuery);
    const sortedLeaderboard = leaderboardSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.score - a.score);
    const rank = sortedLeaderboard.findIndex((p) => p.id === anonId) + 1;

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

    // 6. Update Main Profile Stats
    const profileRef = doc(db, `profiles/${newUserUid}`);
    const profileStatsUpdate = {
      stats: {
        gamesPlayed: increment(1),
        totalQuestionsCorrect: increment(player.questionsCorrect),
        totalAnswerTimeMs: increment(player.totalAnswerTimeMs),
      },
    };
    batch.set(profileRef, profileStatsUpdate, { merge: true });

    // 7. Commit
    await batch.commit();
    console.log(
      `Successfully migrated stats for anonymous user ${anonId} to profile ${newUserUid}`
    );
  } catch (error) {
    console.error('Error migrating anonymous stats:', error);
  }
};

/**
 * Gets a paginated list of a user's match history.
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