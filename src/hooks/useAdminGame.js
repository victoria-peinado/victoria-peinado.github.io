// src/hooks/useAdminGame.js
import { useGameControls } from './admin/useGameControls';
import { useBroadcast } from './admin/useBroadcast';
import { useShareLink } from './admin/useShareLink';

export function useAdminGame(gameSession, gameId, questions) {
  // 1. Core game controls (provides handleMessage)
  const gameControls = useGameControls(gameSession, gameId, questions);

  // 2. Broadcast logic (consumes handleMessage)
  const broadcast = useBroadcast({
    gameId,
    handleMessage: gameControls.handleMessage,
  });
  
  // 3. Share link logic
  const shareLink = useShareLink(gameSession?.gamePin);

  // 4. Combine and return all state and handlers
  return {
    ...gameControls,
    ...broadcast,
    ...shareLink,
  };
}