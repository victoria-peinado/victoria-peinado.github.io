// src/hooks/useAdminDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

// UPDATED: Imports from new service locations
import { getQuestionBanks } from '../services/bank/bankManagement';
import { 
  getGamesForAdmin, 
  deleteGame, 
  createNewGame 
} from '../services/game/gameManagement';

export function useAdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // All state is now managed here
  const [questionBanks, setQuestionBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionCounts, setQuestionCounts] = useState({});
  const [newGameName, setNewGameName] = useState('');
  const [newGameTheme, setNewGameTheme] = useState('default'); // <-- THIS IS THE FIX
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  // NEW: State to hold the custom theme colors
  // We use the default "Primal Mana" colors as the starting point.
  const [customThemeData, setCustomThemeData] = useState({
    primary: '#619A5A',
    primaryLight: '#8BC34A',
    primaryDark: '#38703A',
    secondary: '#D32F2F',
    secondaryDark: '#B71C1C',
  });

  const handleMessage = useCallback((text, type) => {
    if (type === 'error') {
      toast.error(text);
    } else {
      toast.success(text);
    }
  }, []);

  // Fetch question banks (useEffect is unchanged)
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banks = await getQuestionBanks(currentUser.uid);
        setQuestionBanks(banks);
        const counts = {};
        for (const bank of banks) {
          try {
            const questionsRef = collection(db, `questionBanks/${bank.id}/questions`);
            const snapshot = await getDocs(questionsRef);
            counts[bank.id] = snapshot.size;
          } catch (error) {
            console.error(`Error fetching questions for bank ${bank.id}:`, error);
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

  // Fetch games (useEffect is unchanged)
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const querySnapshot = await getGamesForAdmin(currentUser.uid);
        const gamesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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
      setGames(games.filter(game => game.id !== gameToDelete));
      handleMessage('Game deleted successfully', 'success');
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting game:', error);
      handleMessage(error.message, 'error');
      handleCloseModal();
    }
  };

  // UPDATED: handleCreateGame now passes either a string or an object
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
      handleMessage('Selected question bank has no questions! Upload a CSV first.', 'error');
      return;
    }

    // NEW: Determine what to send to Firebase
    let themeOrData;
    if (newGameTheme === 'custom') {
      themeOrData = customThemeData; // Send the object
    } else {
      themeOrData = newGameTheme; // Send the string (e.g., "flare")
    }

    try {
      const gameId = await createNewGame(
        currentUser.uid, 
        selectedBankId, 
        newGameName, 
        themeOrData // Pass the new variable
      );
      handleMessage('Game created successfully!', 'success');
      setNewGameName('');
      navigate(`/admin/game/${gameId}`);
    } catch (error) {
      console.error('Error creating game:', error);
      handleMessage(error.message, 'error');
    }
  };

  const handleOpenGame = (gameId) => {
    navigate(`/admin/game/${gameId}`);
  };

  const getBankDisplayName = (bank) => {
    const name = bank.name || bank.title || 'Untitled Bank';
    const count = questionCounts[bank.id] ?? 0;
    return `${name} (${count} questions)`;
  };

  // Return everything the UI needs
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
    getBankDisplayName
  };
}