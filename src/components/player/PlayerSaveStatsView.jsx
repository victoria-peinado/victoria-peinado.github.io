// src/components/player/PlayerSaveStatsView.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { db } from '../../firebase';
import LoadingSpinner from '../common/LoadingSpinner';
import FinalLeaderboard from '../common/FinalLeaderboard'; // 1. Import FinalLeaderboard

export default function PlayerSaveStatsView({ gameId, playerId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [playerData, loading] = useDocumentData(
    doc(db, `gameSessions/${gameId}/players/${playerId}`)
  );

  const handleSignup = () => {
    navigate(`/signup?fromGame=${gameId}&anonId=${playerId}`);
  };

  const handleExit = () => {
    navigate('/'); 
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-6">
      
      {/* 2. Show the Full Leaderboard First */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-2xl font-display text-primary-light mb-4">
            {t('leaderboard.finalTitle', 'Final Standings')}
          </h2>
          <div className="max-h-60 overflow-y-auto">
             <FinalLeaderboard gameId={gameId} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Show the "Save Stats" Call to Action */}
      <Card className="border-2 border-primary">
        <CardContent className="p-8">
          <CardTitle className="text-3xl mb-2">
            {t('saveStats.title', 'Great Game!')}
          </CardTitle>
          
          {!loading && playerData && (
             <p className="text-neutral-300 mb-6 text-lg">
               You scored <span className="text-primary font-bold">{playerData.score} points</span> as a guest.
             </p>
          )}

          <p className="text-neutral-200 mb-6">
            {t('saveStats.subtitle', 'Don\'t lose your victory! Create an account now to save this match to your permanent history.')}
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleSignup}
              variant="primary"
              className="w-full text-lg py-4 shadow-lg shadow-primary/20"
            >
              {t('saveStats.createAccount', 'Create Account & Save Stats')}
            </Button>
            <Button
              onClick={handleExit}
              variant="neutral"
              className="w-full text-sm"
            >
              {t('saveStats.noThanks', 'No Thanks, I\'ll lose my data')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}