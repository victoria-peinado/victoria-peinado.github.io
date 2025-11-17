// src/pages/PlayerProfile.jsx
import React from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import LoadingScreen from '../components/common/LoadingScreen';
import LoadingSpinner from '../components/common/LoadingSpinner';

console.log('--- PlayerProfile.jsx Component Rendered ---'); // <-- DEBUG LINE

export default function PlayerProfile() {
  const {
    profile,
    loadingProfile,
    stats,
    lifetimeAvgAnswerTime,
    matches,
    loadingMatches,
    hasMore,
    fetchMoreMatches,
    totalMatchesToShow,
  } = useUserProfile();

  if (loadingProfile) {
    return <LoadingScreen text="Loading Profile..." />;
  }

  if (!profile) {
    return (
      <div className="text-center p-8 text-neutral-300">
        Could not load user profile.
      </div>
    );
  }

  // A helper component for stat cards
  const StatCard = ({ title, value, unit }) => (
    <Card className="p-6 text-center bg-neutral-800">
      <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
        {title}
      </p>
      <p className="text-4xl font-bold font-display text-primary">
        {value}
        {unit && <span className="text-lg text-neutral-300 ml-1">{unit}</span>}
      </p>
    </Card>
  );

  // A helper component for match history cards
  const MatchCard = ({ match }) => (
    <Card className="p-4 bg-neutral-800 flex justify-between items-center">
      <div>
        <h3 className="text-xl font-bold text-white">{match.gameName}</h3>
        <p className="text-sm text-neutral-400">{match.gameDate}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-primary">Rank {match.finalRank}</p>
        <p className="text-neutral-300">{match.finalScore} Points</p>
        <p className="text-neutral-400 text-sm">
          {match.questionsCorrect} Correct
        </p>
      </div>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-display font-bold text-white mb-2">
        {profile.displayName}
      </h1>
      <p className="text-lg text-neutral-400 mb-8">{profile.email}</p>

      {/* --- Lifetime Stats --- */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-display text-white mb-4">
          Lifetime Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Games Played" value={stats.gamesPlayed || 0} />
          <StatCard
            title="Total Correct"
            value={stats.totalQuestionsCorrect || 0}
            unit="Answers"
          />
          <StatCard
            title="Avg. Answer Time"
            value={lifetimeAvgAnswerTime}
            unit="sec"
          />
        </div>
      </Card>

      {/* --- Match History --- */}
      <Card className="p-6">
        <h2 className="text-2xl font-display text-white mb-4">
          Match History
        </h2>
        <div className="space-y-4">
          {matches.length === 0 && !loadingMatches && (
            <p className="text-neutral-400 text-center py-4">
              No matches played yet. Go join a game!
            </p>
          )}

          {matches.map((match) => (
            <MatchCard key={match.gameId} match={match} />
          ))}

          {loadingMatches && <LoadingSpinner />}

          {hasMore && totalMatchesToShow < 20 && (
            <Button
              onClick={fetchMoreMatches}
              disabled={loadingMatches}
              variant="primary"
              className="w-full"
            >
              {loadingMatches ? 'Loading...' : 'Load More (10)'}
            </Button>
          )}

          {totalMatchesToShow >= 20 && (
            <p className="text-neutral-400 text-center text-sm pt-4">
              Showing the 20 most recent matches.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}