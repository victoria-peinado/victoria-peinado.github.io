// src/hooks/useUserProfile.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getProfile,
  createProfile,
  getMatchHistoryPaginated,
} from '../services/player/profileService';

const MAX_MATCH_LIMIT = 20;

export const useUserProfile = () => {
  const { currentUser } = useAuth();

  // State for the main profile
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // State for the paginated match history
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // --- THIS IS THE FIX ---
  // Add a state to track if we've attempted the first fetch
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // --- 1. Fetch Main Profile ---
  useEffect(() => {
    console.log('--- useUserProfile DEBUG ---');

    if (currentUser?.uid) {
      console.log(`[1] Auth context is ready. Fetching profile for UID: ${currentUser.uid}`);
      
      const fetchProfile = async () => {
        setLoadingProfile(true);
        
        try {
          const profileData = await getProfile(currentUser.uid);

          if (profileData) {
            console.log('[2] SUCCESS: Profile data found!', profileData);
            setProfile(profileData);
          } else {
            console.log('[2] Profile data NOT found. Calling createProfile...');
            const defaultDisplayName = currentUser.email.split('@')[0];
            await createProfile(
              currentUser.uid,
              currentUser.email,
              defaultDisplayName
            );
            
            console.log('[3] Profile created. Refetching data...');
            const newProfileData = await getProfile(currentUser.uid);
            
            if (newProfileData) {
              console.log('[4] SUCCESS: Newly created profile data found!', newProfileData);
              setProfile(newProfileData);
            } else {
              console.error('[4] FAILURE: Still no profile data after create. This is bad.');
            }
          }
        } catch (error) {
          console.error('[!] ERROR during fetchProfile:', error);
        } finally {
          console.log('[5] Setting loadingProfile to false.');
          setLoadingProfile(false);
        }
      };
      
      fetchProfile();

    } else {
      console.log('[1] currentUser or currentUser.uid is missing. Waiting for auth...');
    }
  }, [currentUser]);

  // --- 2. Fetch Match History (Paginated) ---
  const fetchMoreMatches = useCallback(async () => {
    // Add a guard to stop fetching if we know there's no more
    if (loadingMatches || !currentUser?.uid || !hasMore) {
      if (!hasMore) console.log('[Matches] No more matches to fetch.');
      return;
    }

    // Stop if we've already hit the 20-match limit
    if (matches.length >= MAX_MATCH_LIMIT) {
      setHasMore(false);
      return;
    }

    console.log('[Matches] Fetching more matches...');
    setLoadingMatches(true);

    try {
      const { matches: newMatches, lastDoc: newLastDoc } =
        await getMatchHistoryPaginated(currentUser.uid, 10, lastDoc);

      console.log(`[Matches] Found ${newMatches.length} new matches.`);

      setMatches((prevMatches) => {
        const allMatches = [...prevMatches, ...newMatches];
        return allMatches.slice(0, MAX_MATCH_LIMIT);
      });

      setLastDoc(newLastDoc);

      if (
        newMatches.length < 10 ||
        !newLastDoc ||
        matches.length + newMatches.length >= MAX_MATCH_LIMIT
      ) {
        console.log('[Matches] No more matches to load.');
        setHasMore(false);
      }
    } catch (error) {
      console.error('[Matches] Error fetching match history:', error);
    } finally {
      setLoadingMatches(false);
    }
  }, [currentUser?.uid, lastDoc, loadingMatches, matches.length, hasMore]); // Added hasMore

  // --- 3. Initial Match History Load (FIXED) ---
  useEffect(() => {
    // We wait until the profile is loaded AND we haven't attempted the first fetch
    if (profile && !initialFetchDone) {
      console.log('[Matches] Profile loaded. Fetching initial match history.');
      // Mark that we've tried, so this doesn't run again
      setInitialFetchDone(true); 
      fetchMoreMatches();
    }
  }, [profile, initialFetchDone, fetchMoreMatches]); // Use the new state variable

  // --- 4. Calculate Derived Stats ---
  const stats = profile?.stats || {};
  const lifetimeAvgAnswerTime =
    stats.totalQuestionsCorrect > 0
      ? (stats.totalAnswerTimeMs / stats.totalQuestionsCorrect / 1000).toFixed(2)
      : 0;

  const lifetimeAccuracy =
    stats.totalQuestionsAnswered > 0
      ? ((stats.totalQuestionsCorrect / stats.totalQuestionsAnswered) * 100).toFixed(0)
      : 0;

  return {
    profile,
    loadingProfile,
    stats,
    lifetimeAvgAnswerTime,
    matches,
    loadingMatches,
    hasMore,
    fetchMoreMatches,
    totalMatchesToShow: matches.length,
  };
};