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

export default function PlayerSaveStatsView({ gameId, playerId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 1. Fetch this player's specific document to get their final score
  const [playerData, loading, error] = useDocumentData(
    doc(db, `gameSessions/${gameId}/players/${playerId}`)
  );

  // 2. Handler for the "Create Account" button
  const handleSignup = () => {
    // 3. Navigate to signup, passing gameId and anonymousId in the URL
    navigate(`/signup?fromGame=${gameId}&anonId=${playerId}`);
  };

  // 4. Handler for the "No Thanks" button
  const handleExit = () => {
    navigate('/'); // Navigate back to the landing page
  };

  const score = playerData?.score || 0;

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <Card>
        <CardContent className="p-8">
          <CardTitle className="text-3xl mb-4">
            {t('saveStats.title', 'Game Finished!')}
          </CardTitle>
          <p className="text-neutral-200 text-lg mb-6">
            {t('saveStats.subtitle', 'You played as a guest.')}
          </p>

          {loading && <LoadingSpinner />}
          {error && (
            <p className="text-secondary">
              {t('error.loadingScore', 'Could not load your score.')}
            </p>
          )}
          {!loading && playerData && (
            <div className="bg-neutral-800 p-6 rounded-lg mb-8">
              <span className="text-neutral-400 text-sm uppercase font-bold">
                {t('saveStats.yourFinalScore', 'Your Final Score')}
              </span>
              <p className="text-6xl font-display text-primary-light font-bold">
                {score}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleSignup}
              variant="primary"
              className="w-full text-lg"
            >
              {t('saveStats.createAccount', 'Create Account to Save Stats')}
            </Button>
            <Button
              onClick={handleExit}
              variant="neutral"
              className="w-full text-lg"
            >
              {t('saveStats.noThanks', 'No Thanks')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}