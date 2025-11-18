// src/components/admin/CreateGameForm.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';

export default function CreateGameForm({
  loading,
  questionBanks,
  newGameName,
  setNewGameName,
  selectedBankId,
  setSelectedBankId,
  newGameTheme,
  setNewGameTheme,
  themePresets,
  getBankDisplayName,
  handleCreateGame,
}) {
  const { t } = useTranslation();

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <CardTitle className="mb-4">
          {t('admin.dashboard.createGameTitle')}
        </CardTitle>

        {loading ? (
          <p>{t('admin.dashboard.loading')}</p>
        ) : questionBanks.length === 0 ? (
          <div className="text-center py-8 text-neutral-300">
            <p className="mb-4">{t('admin.dashboard.noBanksError')}</p>
            <Link to="/admin/question-banks">
              <Button variant="primary">
                {t('admin.dashboard.createFirstBankButton')}
              </Button>
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleCreateGame}
            className="flex flex-wrap gap-4 items-end"
          >
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="gameName">
                {t('admin.dashboard.gameNameLabel')}
              </Label>
              <Input
                type="text"
                id="gameName"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                placeholder={t('admin.dashboard.gameNamePlaceholder')}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="bankSelect">
                {t('admin.dashboard.bankSelectLabel')}
              </Label>
              <Select
                id="bankSelect"
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
              >
                <option value="">
                  {t('admin.dashboard.bankSelectPlaceholder')}
                </option>
                {questionBanks.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {getBankDisplayName(bank)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="themeSelect">
                {t('admin.dashboard.themeSelectLabel')}
              </Label>
              <Select
                id="themeSelect"
                value={newGameTheme}
                onChange={(e) => setNewGameTheme(e.target.value)}
              >
                <optgroup label="Base Themes">
                  <option value="default">Default (Primal Mana)</option>
                  <option value="flare">Solar Flare</option>
                  <option value="void">Mana Void</option>
                </optgroup>

                {themePresets.length > 0 && (
                  <optgroup label="My Presets">
                    {themePresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value="custom">Custom...</option>
              </Select>
            </div>

            <Button type="submit" variant="primary">
              {t('admin.dashboard.createGameButton')}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}