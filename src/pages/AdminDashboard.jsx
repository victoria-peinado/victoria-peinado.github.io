// src/pages/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

// --- Import UI Components ---
import ConfirmModal from '../components/common/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Label } from '../components/ui/Label';
import { CustomThemeForm } from '../components/admin/CustomThemeForm';
import { SavePresetModal } from '../components/admin/SavePresetModal';
import { ThemeVisualizer } from '../components/admin/ThemeVisualizer';

// --- Import NEW Dumb Components ---
import CreateGameForm from '../components/admin/CreateGameForm';
import ThemePresetList from '../components/admin/ThemePresetList';
import GameList from '../components/admin/GameList';

export default function AdminDashboard() {
  const { t } = useTranslation();
  
  // The hook call is unchanged. It still provides all logic.
  const {
    currentUser,
    loading,
    questionBanks,
    selectedBankId,
    setSelectedBankId,
    games,
    newGameName,
    setNewGameName,
    newGameTheme,
    setNewGameTheme,
    customThemeData,
    setCustomThemeData,
    isModalOpen,
    handleCreateGame,
    handleOpenGame,
    handleDeleteClick,
    handleCloseModal,
    handleConfirmDelete,
    getBankDisplayName,
    themePresets,
    isSaveModalOpen,
    setIsSaveModalOpen,
    handleSavePreset,
    currentThemeData,
    showPreview,
    setShowPreview,
    editingPreset,
    isDeletePresetModalOpen,
    presetToDelete,
    handleDeletePresetClick,
    handleCloseDeletePresetModal,
    handleConfirmDeletePreset,
    handleSelectPresetForEdit,
    handleUpdatePreset,
    handleCancelEdit,
  } = useAdminDashboard();

  return (
    <div>
      {/* Header (Unchanged) */}
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

      {/* --- 1. Create Game Form (Now a Component) --- */}
      <CreateGameForm
        loading={loading}
        questionBanks={questionBanks}
        newGameName={newGameName}
        setNewGameName={setNewGameName}
        selectedBankId={selectedBankId}
        setSelectedBankId={setSelectedBankId}
        newGameTheme={newGameTheme}
        setNewGameTheme={setNewGameTheme}
        themePresets={themePresets}
        getBankDisplayName={getBankDisplayName}
        handleCreateGame={handleCreateGame}
      />

      {/* --- 2. Custom Theme & Visualizer Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          {newGameTheme === 'custom' && (
            <>
              <h2 className="text-2xl font-display font-bold mb-4">
                {editingPreset
                  ? `Editing: ${editingPreset.name}`
                  : 'Create Custom Theme'}
              </h2>
              <CustomThemeForm
                themeData={customThemeData}
                onChange={setCustomThemeData}
              />
              <div className="flex items-center gap-3 mt-4">
                {editingPreset ? (
                  <>
                    <Button variant="primary" onClick={handleUpdatePreset}>
                      Update Preset
                    </Button>
                    <Button variant="neutral" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="neutral"
                    onClick={() => setIsSaveModalOpen(true)}
                  >
                    Save as New Preset...
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3 mt-4 p-4 bg-neutral-800 rounded-lg border-2 border-neutral-700">
                <input
                  type="checkbox"
                  id="showPreview"
                  checked={showPreview}
                  onChange={(e) => setShowPreview(e.target.checked)}
                  className="h-5 w-5 rounded bg-accent-black border-neutral-700 text-primary focus:ring-primary focus:ring-offset-neutral-800"
                />
                <Label
                  htmlFor="showPreview"
                  className="mb-0 !text-neutral-100 font-normal"
                >
                  Show Live Preview
                </Label>
              </div>
            </>
          )}
        </div>
        <div>
          {newGameTheme === 'custom' && showPreview && (
            <ThemeVisualizer themeData={currentThemeData} />
          )}
        </div>
      </div>

      {/* --- 3. Theme Preset List (Now a Component) --- */}
      <ThemePresetList
        themePresets={themePresets}
        onEditClick={handleSelectPresetForEdit}
        onDeleteClick={handleDeletePresetClick}
      />

      {/* --- 4. Game List (Now a Component) --- */}
      <GameList
        loading={loading}
        games={games}
        questionBanks={questionBanks}
        onOpenGame={handleOpenGame}
        onDeleteGame={handleDeleteClick}
      />

      {/* --- 5. Modals (Remain here) --- */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title={t('admin.dashboard.modal.title')}
        message={t('admin.dashboard.modal.message')}
        confirmText={t('admin.dashboard.modal.confirmText')}
        confirmVariant="danger"
      />
      <ConfirmModal
        isOpen={isDeletePresetModalOpen}
        onClose={handleCloseDeletePresetModal}
        onConfirm={handleConfirmDeletePreset}
        title="Delete Theme Preset"
        message={`Are you sure you want to delete the preset "${presetToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Preset"
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