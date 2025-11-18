// src/hooks/admin/useAdminCreateGame.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewGame } from '../../services/game/gameManagement';

export function useAdminCreateGame({
  currentUser,
  questionCounts,
  newGameTheme,
  customThemeData,
  themePresets,
  handleMessage,
}) {
  const [newGameName, setNewGameName] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const navigate = useNavigate();

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
      console.error('Error creating game:', error);
      handleMessage(error.message, 'error');
    }
  };

  return {
    newGameName,
    setNewGameName,
    selectedBankId,
    setSelectedBankId,
    handleCreateGame,
  };
}