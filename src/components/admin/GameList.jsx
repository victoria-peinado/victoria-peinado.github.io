// src/components/admin/GameList.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

export default function GameList({
  loading,
  games,
  questionBanks,
  onOpenGame,
  onDeleteGame,
}) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="p-6">
        <CardTitle className="mb-4">
          {t('admin.dashboard.myGamesTitle')}
        </CardTitle>

        {loading ? (
          <p>{t('admin.dashboard.loading')}</p>
        ) : games.length === 0 ? (
          <p className="text-neutral-300 text-center py-4">
            {t('admin.dashboard.noGames')}
          </p>
        ) : (
          <div className="space-y-4">
            {games.map((game) => {
              const bank = questionBanks.find(
                (b) => b.id === game.questionBankId
              );
              const bankName = bank
                ? bank.name || bank.title || t('admin.dashboard.unknownBank')
                : t('admin.dashboard.unknownBank');

              return (
                <div
                  key={game.id}
                  className="border-b border-neutral-700 p-4 flex justify-between items-center hover:bg-neutral-800"
                >
                  <div>
                    <p className="font-bold text-lg text-neutral-100">
                      {game.gameName || t('admin.dashboard.untitledGame')}
                    </p>
                    <p className="text-sm text-neutral-300">
                      {t('gamePin')}{' '}
                      <span className="text-primary-light font-semibold">
                        {game.gamePin}
                      </span>
                    </p>
                    <p className="text-sm text-neutral-300">
                      {t('admin.dashboard.bankPRefix')}: {bankName}
                    </p>
                    <p className="text-sm text-neutral-300">
                      {t('admin.dashboard.statePRefix')}:{' '}
                      <span className="capitalize">{game.state}</span>
                    </p>
                    <p className="text-xs text-neutral-500">
                      {game.createdAt?.toDate().toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onOpenGame(game.id)}
                      variant="primary"
                      className="py-2"
                    >
                      {t('admin.dashboard.manageButton')}
                    </Button>
                    <Button
                      onClick={() => onDeleteGame(game.id)}
                      variant="danger"
                      className="py-2"
                    >
                      {t('admin.dashboard.deleteButton')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}