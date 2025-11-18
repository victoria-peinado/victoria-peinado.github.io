// src/hooks/useAdminDashboard.js
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Import the new, deconstructed hooks
import { useAdminBankLoader } from './admin/useAdminBankLoader';
import { useAdminGameList } from './admin/useAdminGameList';
import { useAdminTheme } from './admin/useAdminTheme';
import { useAdminCreateGame } from './admin/useAdminCreateGame';

export function useAdminDashboard() {
  const { currentUser } = useAuth();

  // The toast handler is the one piece of shared logic
  // that all hooks will use (passed as a prop).
  const handleMessage = useCallback((text, type) => {
    if (type === 'error') {
      toast.error(text);
    } else {
      toast.success(text);
    }
  }, []);

  // Call the new hooks, passing in dependencies
  const { questionBanks, questionCounts, getBankDisplayName } =
    useAdminBankLoader({ currentUser, handleMessage });

  const {
    games,
    loading,
    isModalOpen,
    handleDeleteClick,
    handleCloseModal,
    handleConfirmDelete,
    handleOpenGame,
  } = useAdminGameList({ currentUser, handleMessage });

  const themeHookData = useAdminTheme({ currentUser, handleMessage });

  const {
    newGameName,
    setNewGameName,
    selectedBankId,
    setSelectedBankId,
    handleCreateGame,
  } = useAdminCreateGame({
    currentUser,
    handleMessage,
    questionCounts,
    newGameTheme: themeHookData.newGameTheme,
    customThemeData: themeHookData.customThemeData,
    themePresets: themeHookData.themePresets,
  });

  // Combine all returned values into one giant object for the page
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
    isModalOpen,
    handleCreateGame,
    handleOpenGame,
    handleDeleteClick,
    handleCloseModal,
    handleConfirmDelete,
    getBankDisplayName,
    ...themeHookData, // Spread all theme state and handlers
  };
}