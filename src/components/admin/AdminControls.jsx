// src/components/admin/AdminControls.jsx
import React from 'react';
import { Button } from '../ui/Button';
import { useAudio } from '../../hooks/useAudio'; // 1. Import useAudio

function AdminControls({
  onShowQuestion,
  onShowLeaderboard,
  onEndGame,
  gameSession,
  isBusy,
}) {
  const { playSound, setMusic } = useAudio(); // 2. Get audio functions
  const gameState = gameSession?.state;

  // 3. Create wrapper for showing a question
  const handleShowQuestion = () => {
    playSound('question_reveal');
    setMusic('music_question.mp3'); // Set tense music
    onShowQuestion(); // Call original function
  };

  // 4. Create wrapper for showing leaderboard
  const handleShowLeaderboard = () => {
    setMusic('music_lobby.mp3'); // Set calm/lobby music
    onShowLeaderboard(); // Call original function
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleShowQuestion} // 5. Use new handler
        disabled={isBusy || gameState === 'finished' || gameState === 'questionactive'}
        variant="primary"
        className="w-full py-3"
      >
        {gameState === 'waiting' ? 'Start Game' : 'Next Question'}
      </Button>

      <Button
        onClick={handleShowLeaderboard} // 6. Use new handler
        disabled={isBusy || (gameState !== 'answerrevealed' && gameState !== 'leaderboard')}
        variant="secondary"
        className="w-full py-3"
      >
        Show Leaderboard
      </Button>

      <Button
        onClick={onEndGame} // No audio needed for this one per the doc
        disabled={isBusy || gameState === 'finished'}
        variant="danger"
        className="w-full py-3"
      >
        End Game
      </Button>

      {/* Status Messages */}
      {gameState === 'questionactive' && (
        <div className="mt-4 p-4 bg-primary-dark rounded-lg border border-primary">
          <p className="text-primary-light font-semibold text-center">
            Timer is running...
          </p>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="mt-4 p-4 bg-neutral-800 rounded-lg border border-primary-light">
          <p className="text-primary-light font-semibold text-center">
            Game has ended!
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminControls;