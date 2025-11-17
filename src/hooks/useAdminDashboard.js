// src/hooks/useAdminDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

import { getQuestionBanks } from '../services/bank/bankManagement';
import {
  getGamesForAdmin,
  deleteGame,
  createNewGame,
} from '../services/game/gameManagement';
import {
  getThemePresets,
  saveThemePreset,
  deleteThemePreset, // <-- SPRINT 14: Import
  updateThemePreset, // <-- SPRINT 14: Import
} from '../services/admin/themeService';

// --- Theme constants for the visualizer ---
const DEFAULT_THEME_DATA = {
  primary: '#619A5A',
  primaryLight: '#8BC34A',
  primaryDark: '#38703A',
  secondary: '#D32F2F',
  secondaryDark: '#B71C1C',
  accentBlue: '#0D47A1',
  accentGreen: '#22c55e',
  accentBlack: '#212121',
  textOnPrimary: '#ffffff',
};

const FLARE_THEME_DATA = {
  primary: '#FF9800',
  primaryLight: '#FFB74D',
  primaryDark: '#F57C00',
  secondary: '#FFEB3B',
  secondaryDark: '#FBC02D',
  accentBlue: '#0D47A1',
  accentGreen: '#22c55e',
  accentBlack: '#212121',
  textOnPrimary: '#000000',
};

const VOID_THEME_DATA = {
  primary: '#673AB7',
  primaryLight: '#9575CD',
  primaryDark: '#512DA8',
  secondary: '#00BCD4',
  secondaryDark: '#0097A7',
  accentBlue: '#0D47A1',
  accentGreen: '#22c55e',
  accentBlack: '#212121',
  textOnPrimary: '#ffffff',
};
// --- End Theme Constants ---

export function useAdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [questionBanks, setQuestionBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionCounts, setQuestionCounts] = useState({});
  const [newGameName, setNewGameName] = useState('');
  const [newGameTheme, setNewGameTheme] = useState('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [customThemeData, setCustomThemeData] = useState(DEFAULT_THEME_DATA);
  const [themePresets, setThemePresets] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentThemeData, setCurrentThemeData] = useState(DEFAULT_THEME_DATA);

  const [showPreview, setShowPreview] = useState(false);

  // --- SPRINT 14: New state for preset editing/deleting ---
  const [editingPreset, setEditingPreset] = useState(null); // { id, name, themeData }
  const [isDeletePresetModalOpen, setIsDeletePresetModalOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState(null); // { id, name }
  // ---

  const handleMessage = useCallback((text, type) => {
    if (type === 'error') {
      toast.error(text);
    } else {
      toast.success(text);
    }
  }, []);

  // Fetch question banks (unchanged)
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banks = await getQuestionBanks(currentUser.uid);
        setQuestionBanks(banks);
        const counts = {};
        for (const bank of banks) {
          try {
            const questionsRef = collection(
              db,
              `questionBanks/${bank.id}/questions`
            );
            const snapshot = await getDocs(questionsRef);
            counts[bank.id] = snapshot.size;
          } catch (error) {
            console.error(
              `Error fetching questions for bank ${bank.id}:`,
              error
            );
            counts[bank.id] = 0;
          }
        }
        setQuestionCounts(counts);
      } catch (error) {
        console.error('Error fetching banks:', error);
        handleMessage('Error loading question banks', 'error');
      }
    };
    if (currentUser) {
      fetchBanks();
    }
  }, [currentUser, handleMessage]);

  // Fetch games (unchanged)
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const querySnapshot = await getGamesForAdmin(currentUser.uid);
        const gamesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGames(gamesData);
      } catch (error) {
        console.error('Error fetching games:', error);
        handleMessage('Error loading games', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) {
      fetchGames();
    }
  }, [currentUser, handleMessage]);

  // Fetch Theme Presets (unchanged)
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

  // Effect to update the Live Visualizer (unchanged)
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
        // If we're in "custom" mode, the visualizer should
        // show the data from the color pickers
        setCurrentThemeData(customThemeData);
        break;
      default:
        // This means a preset is selected from the dropdown
        const preset = themePresets.find((p) => p.id === newGameTheme);
        if (preset) {
          // Ensure loaded preset has new values, or use default
          setCurrentThemeData({
            ...DEFAULT_THEME_DATA,
            ...preset.themeData,
          });
        } else {
          setCurrentThemeData(DEFAULT_THEME_DATA);
        }
    }
  }, [newGameTheme, customThemeData, themePresets]);

  // Reset preview toggle if not in custom mode (unchanged)
  useEffect(() => {
    if (newGameTheme !== 'custom') {
      setShowPreview(false);
      // SPRINT 14: Also cancel editing if we switch away
      if (editingPreset) {
        setEditingPreset(null);
        setCustomThemeData(DEFAULT_THEME_DATA); // Reset form
      }
    }
  }, [newGameTheme, editingPreset]);

  // Delete handlers (unchanged)
  const handleDeleteClick = (gameId) => {
    setGameToDelete(gameId);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGameToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!gameToDelete) return;
    try {
      await deleteGame(gameToDelete);
      setGames(games.filter((game) => game.id !== gameToDelete));
      handleMessage('Game deleted successfully', 'success');
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting game:', error);
      handleMessage(error.message, 'error');
      handleCloseModal();
    }
  };

  // handleCreateGame (unchanged)
  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!newGameName) {
      handleMessage('Please enter a game name', 'error');
      return;
    }
    if (!selectedBankId) {
      handleMessage('Please select a question bank', 'error');
      return;
    }
    const questionCount = questionCounts[selectedBankId] || 0;
    if (questionCount === 0) {
      handleMessage(
        'Selected question bank has no questions! Upload a CSV first.',
        'error'
      );
      return;
    }

    let themeOrData;
    if (newGameTheme === 'custom') {
      themeOrData = customThemeData;
    } else if (['default', 'flare', 'void'].includes(newGameTheme)) {
      themeOrData = newGameTheme;
    } else {
      const preset = themePresets.find((p) => p.id === newGameTheme);
      if (preset) {
        themeOrData = preset.themeData;
      } else {
        handleMessage('Selected preset not found. Defaulting theme.', 'error');
        themeOrData = 'default';
      }
    }

    try {
      const gameId = await createNewGame(
        currentUser.uid,
        selectedBankId,
        newGameName,
        themeOrData
      );
      handleMessage('Game created successfully!', 'success');
      setNewGameName('');
      navigate(`/admin/game/${gameId}`);
    } catch (error) {
      // <-- THIS IS THE FIX. Added '{'
      console.error('Error creating game:', error);
      handleMessage(error.message, 'error');
    }
  };

  // Handle Save Preset (unchanged)
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

  // --- SPRINT 14: New Handlers for Preset CRUD ---

  /**
   * Triggers the delete confirmation modal for a theme preset.
   */
  const handleDeletePresetClick = (preset) => {
    setPresetToDelete(preset);
    setIsDeletePresetModalOpen(true);
  };

  /**
   * Closes the preset delete modal.
   */
  const handleCloseDeletePresetModal = () => {
    setIsDeletePresetModalOpen(false);
    setPresetToDelete(null);
  };

  /**
   * Deletes the preset, re-fetches, and closes the modal.
   */
  const handleConfirmDeletePreset = async () => {
    if (!presetToDelete) return;
    try {
      await deleteThemePreset(currentUser.uid, presetToDelete.id);
      handleMessage(`Preset "${presetToDelete.name}" deleted.`, 'success');
      fetchPresets(); // Re-fetch presets
      handleCloseDeletePresetModal();
    } catch (error) {
      handleMessage(error.message, 'error');
    }
  };

  /**
   * Loads a preset's data into the "Custom" form for editing.
   */
  const handleSelectPresetForEdit = (preset) => {
    setEditingPreset(preset);
    setNewGameTheme('custom'); // Switch dropdown to "Custom"
    // Load preset's colors into the color pickers
    setCustomThemeData({ ...DEFAULT_THEME_DATA, ...preset.themeData });
    setShowPreview(true); // Automatically show preview
    toast.success(`Editing "${preset.name}".`);
  };

  /**
   * Saves the changes to the currently editing preset.
   */
  const handleUpdatePreset = async () => {
    if (!editingPreset) return;
    try {
      // We need a name. For now, we'll just re-use the old one.
      // A full "edit name" flow would be in SavePresetModal.
      await updateThemePreset(
        currentUser.uid,
        editingPreset.id,
        editingPreset.name, // Re-using old name
        customThemeData // Using current form data
      );
      handleMessage(`Preset "${editingPreset.name}" updated!`, 'success');
      fetchPresets();
      // Exit editing mode
      handleCancelEdit();
    } catch (error) {
      handleMessage(error.message, 'error');
    }
  };

  /**
   * Exits editing mode and resets the form.
   */
  const handleCancelEdit = () => {
    setEditingPreset(null);
    setNewGameTheme('default'); // Reset dropdown
    setCustomThemeData(DEFAULT_THEME_DATA); // Reset form
    setShowPreview(false);
  };

  // --- End SPRINT 14 Handlers ---

  const handleOpenGame = (gameId) => {
    navigate(`/admin/game/${gameId}`);
  };

  const getBankDisplayName = (bank) => {
    const name = bank.name || bank.title || 'Untitled Bank';
    const count = questionCounts[bank.id] ?? 0;
    return `${name} (${count} questions)`;
  };

  return {
    currentUser,
    loading,
    questionBanks,
    selectedBankId,
    setSelectedBankId,
    games,
    questionCounts,
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
    // --- SPRINT 14: Export new state and handlers ---
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