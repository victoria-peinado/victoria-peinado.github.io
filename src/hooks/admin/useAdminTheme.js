// src/hooks/admin/useAdminTheme.js
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getThemePresets,
  saveThemePreset,
  deleteThemePreset,
  updateThemePreset,
} from '../../services/admin/themeService';
import {
  DEFAULT_THEME_DATA,
  FLARE_THEME_DATA,
  VOID_THEME_DATA,
} from '../../utils/themeConstants';

export function useAdminTheme({ currentUser, handleMessage }) {
  const [newGameTheme, setNewGameTheme] = useState('default');
  const [customThemeData, setCustomThemeData] = useState(DEFAULT_THEME_DATA);
  const [themePresets, setThemePresets] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentThemeData, setCurrentThemeData] = useState(DEFAULT_THEME_DATA);
  const [showPreview, setShowPreview] = useState(false);

  // --- SPRINT 14: State for preset editing/deleting ---
  const [editingPreset, setEditingPreset] = useState(null); // { id, name, themeData }
  const [isDeletePresetModalOpen, setIsDeletePresetModalOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState(null); // { id, name }
  // ---

  // Fetch Theme Presets
  const fetchPresets = useCallback(async () => {
    if (!currentUser) return;
    try {
      const presets = await getThemePresets(currentUser.uid);
      setThemePresets(presets);
    } catch (error) {
      handleMessage('Could not load theme presets', 'error');
    }
  }, [currentUser, handleMessage]);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  // Effect to update the Live Visualizer
  useEffect(() => {
    switch (newGameTheme) {
      case 'default':
        setCurrentThemeData(DEFAULT_THEME_DATA);
        break;
      case 'flare':
        setCurrentThemeData(FLARE_THEME_DATA);
        break;
      case 'void':
        setCurrentThemeData(VOID_THEME_DATA);
        break;
      case 'custom':
        setCurrentThemeData(customThemeData);
        break;
      default:
        const preset = themePresets.find((p) => p.id === newGameTheme);
        if (preset) {
          setCurrentThemeData({
            ...DEFAULT_THEME_DATA,
            ...preset.themeData,
          });
        } else {
          setCurrentThemeData(DEFAULT_THEME_DATA);
        }
    }
  }, [newGameTheme, customThemeData, themePresets]);

  // Reset preview toggle if not in custom mode
  useEffect(() => {
    if (newGameTheme !== 'custom') {
      setShowPreview(false);
      if (editingPreset) {
        setEditingPreset(null);
        setCustomThemeData(DEFAULT_THEME_DATA); // Reset form
      }
    }
  }, [newGameTheme, editingPreset]);

  // Handle Save Preset
  const handleSavePreset = async (presetName) => {
    try {
      await saveThemePreset(currentUser.uid, presetName, customThemeData);
      handleMessage('Theme preset saved!', 'success');
      fetchPresets(); // Re-fetch to update dropdown
      setIsSaveModalOpen(false);
    } catch (error) {
      handleMessage(error.message, 'error');
    }
  };

  // --- SPRINT 14: Handlers for Preset CRUD ---
  const handleDeletePresetClick = (preset) => {
    setPresetToDelete(preset);
    setIsDeletePresetModalOpen(true);
  };

  const handleCloseDeletePresetModal = () => {
    setIsDeletePresetModalOpen(false);
    setPresetToDelete(null);
  };

  const handleConfirmDeletePreset = async () => {
    if (!presetToDelete) return;
    try {
      await deleteThemePreset(currentUser.uid, presetToDelete.id);
      handleMessage(`Preset "${presetToDelete.name}" deleted.`, 'success');
      fetchPresets();
      handleCloseDeletePresetModal();
    } catch (error) {
      handleMessage(error.message, 'error');
    }
  };

  const handleSelectPresetForEdit = (preset) => {
    setEditingPreset(preset);
    setNewGameTheme('custom');
    setCustomThemeData({ ...DEFAULT_THEME_DATA, ...preset.themeData });
    setShowPreview(true);
    toast.success(`Editing "${preset.name}".`);
  };

  const handleUpdatePreset = async () => {
    if (!editingPreset) return;
    try {
      await updateThemePreset(
        currentUser.uid,
        editingPreset.id,
        editingPreset.name,
        customThemeData
      );
      handleMessage(`Preset "${editingPreset.name}" updated!`, 'success');
      fetchPresets();
      handleCancelEdit();
    } catch (error) {
      handleMessage(error.message, 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingPreset(null);
    setNewGameTheme('default');
    setCustomThemeData(DEFAULT_THEME_DATA);
    setShowPreview(false);
  };
  // --- End SPRINT 14 Handlers ---

  return {
    newGameTheme,
    setNewGameTheme,
    customThemeData,
    setCustomThemeData,
    themePresets,
    isSaveModalOpen,
    setIsSaveModalOpen,
    currentThemeData,
    showPreview,
    setShowPreview,
    handleSavePreset,
    editingPreset,
    isDeletePresetModalOpen,
    presetToDelete,
    handleDeletePresetClick,
    handleCloseDeletePresetModal,
    handleConfirmDeletePreset,
    handleSelectPresetForEdit,
    handleUpdatePreset,
    handleCancelEdit,
  };
}