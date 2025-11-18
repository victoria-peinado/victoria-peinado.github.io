// src/hooks/admin/useAdminGameList.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGamesForAdmin, deleteGame } from '../../services/game/gameManagement';

export function useAdminGameList({ currentUser, handleMessage }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const navigate = useNavigate();

  // Fetch games
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

  // Delete handlers
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

  const handleOpenGame = (gameId) => {
    navigate(`/admin/game/${gameId}`);
  };

  return {
    games,
    loading,
    isModalOpen,
    handleDeleteClick,
    handleCloseModal,
    handleConfirmDelete,
    handleOpenGame,
  };
}