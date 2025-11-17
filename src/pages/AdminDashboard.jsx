// src/pages/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

import ConfirmModal from '../components/common/ConfirmModal';
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { CustomThemeForm } from '../components/admin/CustomThemeForm';

import { SavePresetModal } from '../components/admin/SavePresetModal';
import { ThemeVisualizer } from '../components/admin/ThemeVisualizer';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const {
    currentUser, loading,
    questionBanks,
    selectedBankId, setSelectedBankId, games,
    newGameName, setNewGameName, 
    newGameTheme, setNewGameTheme,
    customThemeData, setCustomThemeData,
    isModalOpen,
    handleCreateGame, handleOpenGame, handleDeleteClick,
    handleCloseModal, handleConfirmDelete, getBankDisplayName,
    themePresets,
    isSaveModalOpen,
    setIsSaveModalOpen,
    handleSavePreset,
    currentThemeData,

    // --- NEW: Get Checkbox State ---
    showPreview,
    setShowPreview,
  } = useAdminDashboard();

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display font-bold">
            {t('admin.dashboard.title')}
          </h1>
          <p className="text-neutral-300 mt-2">
            {t('admin.dashboard.signInPRefix')}: {currentUser?.email}
          </p>
        </div>
        <Link to="/admin/question-banks">
          <Button variant="primary">
            {t('admin.dashboard.manageBanksButton')}
          </Button>
        </Link>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <CardTitle className="mb-4">{t('admin.dashboard.createGameTitle')}</CardTitle>
          
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
            <form onSubmit={handleCreateGame} className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="gameName">{t('admin.dashboard.gameNameLabel')}</Label>
                <Input
                  type="text"
                  id="gameName"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  placeholder={t('admin.dashboard.gameNamePlaceholder')}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="bankSelect">{t('admin.dashboard.bankSelectLabel')}</Label>
                <Select
                  id="bankSelect"
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                >
                  <option value="">{t('admin.dashboard.bankSelectPlaceholder')}</option>
                  {questionBanks.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {getBankDisplayName(bank)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Updated Theme Select (unchanged from last step) */}
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="themeSelect">{t('admin.dashboard.themeSelectLabel')}</Label>
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
                      {themePresets.map(preset => (
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

              {newGameTheme === 'custom' && (
                <Button 
                  type="button" 
                  variant="neutral"
                  onClick={() => setIsSaveModalOpen(true)}
                >
                  Save as Preset...
                </Button>
              )}
            </form>
          )}
        </CardContent>
      </Card>

      {/* --- UPDATED: Two-Column Layout for Custom Theme & Visualizer --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          {/* This column wrapper only shows if 'custom' is selected */}
          {newGameTheme === 'custom' && (
            <>
              <CustomThemeForm 
                themeData={customThemeData} 
                onChange={setCustomThemeData} 
              />
              {/* --- NEW: Show Preview Checkbox --- */}
              <div className="flex items-center gap-3 mt-4 p-4 bg-neutral-800 rounded-lg border-2 border-neutral-700">
                <input
                  type="checkbox"
                  id="showPreview"
                  checked={showPreview}
                  onChange={(e) => setShowPreview(e.target.checked)}
                  className="h-5 w-5 rounded bg-accent-black border-neutral-700 text-primary focus:ring-primary focus:ring-offset-neutral-800"
                />
                <Label htmlFor="showPreview" className="mb-0 !text-neutral-100 font-normal">
                  Show Live Preview
                </Label>
              </div>
            </>
          )}
        </div>
        <div>
          {/* --- NEW: Visualizer is now conditional on 'custom' theme AND checkbox --- */}
          {newGameTheme === 'custom' && showPreview && (
            <ThemeVisualizer themeData={currentThemeData} />
          )}
        </div>
      </div>
      {/* --- END UPDATED LAYOUT --- */}


      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-4">{t('admin.dashboard.myGamesTitle')}</CardTitle>
          
          {loading ? (
            <p>{t('admin.dashboard.loading')}</p>
          ) : games.length === 0 ? (
            <p className="text-neutral-300 text-center py-4">{t('admin.dashboard.noGames')}</p>
          ) : (
            <div className="space-y-4">
              {games.map(game => {
                const bank = questionBanks.find(b => b.id === game.questionBankId);
                const bankName = bank ? (bank.name || bank.title || t('admin.dashboard.unknownBank')) : t('admin.dashboard.unknownBank');
                
                return (
                  <div key={game.id} className="border-b border-neutral-700 p-4 flex justify-between items-center hover:bg-neutral-800">
                    <div>
                      <p className="font-bold text-lg text-neutral-100">
                        {game.gameName || t('admin.dashboard.untitledGame')}
                      </p>
                      <p className="text-sm text-neutral-300">
                        {t('gamePin')} <span className="text-primary-light font-semibold">{game.gamePin}</span>
                      </p>
                      <p className="text-sm text-neutral-300">{t('admin.dashboard.bankPRefix')}: {bankName}</p>
                      <p className="text-sm text-neutral-300">
                        {t('admin.dashboard.statePRefix')}: <span className="capitalize">{game.state}</span>
                      </p>
                      <p className="text-xs text-neutral-500">
                        {game.createdAt?.toDate().toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenGame(game.id)}
                        variant="primary"
                        className="py-2"
                      >
                        {t('admin.dashboard.manageButton')}
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(game.id)}
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

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title={t('admin.dashboard.modal.title')}
        message={t('admin.dashboard.modal.message')}
        confirmText={t('admin.dashboard.modal.confirmText')}
        confirmVariant="danger"
      />

      <SavePresetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSavePreset}
      />
    </div>
  );
}