// src/hooks/useAdminDashboard.js
import { useState, useEffect, useCallback } from 'react'; // 1. Import useCallback
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast'; // 2. Import toast

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
  // const [message, setMessage] = useState({ text: '', type: '' }); // 3. REMOVED message state
  const [questionCounts, setQuestionCounts] = useState({});
  const [newGameName, setNewGameName] = useState('');
  const [newGameTheme, setNewGameTheme] = useState('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  // 4. UPDATED handleMessage to use toast
  const handleMessage = useCallback((text, type) => {
    if (type === 'error') {
      toast.error(text);
    } else {
      toast.success(text);
    }
  }, []); // Empty dependency array

  // Fetch question banks and their counts
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        // UPDATED: Using new service
        const banks = await getQuestionBanks(currentUser.uid);
        setQuestionBanks(banks);

        // Fetch question counts for each bank
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
  }, [currentUser, handleMessage]); // 5. Added handleMessage

  // Fetch games for admin
  useEffect(() => {
    const fetchGames = async () => {
      try {
        // UPDATED: Using new service
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
  }, [currentUser, handleMessage]); // 6. Added handleMessage

  // All handlers are now here
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
      // UPDATED: Using new service
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

    try {
      // UPDATED: Pass the newGameTheme to the service
      const gameId = await createNewGame(
        currentUser.uid, 
        selectedBankId, 
        newGameName, 
        newGameTheme 
      );
      handleMessage('Game created successfully!', 'success');
      setNewGameName('');
      // We don't reset the theme, as the admin might want to create another game
      // with the same theme.
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
    // message, // 7. REMOVED message from return
    questionBanks,
    selectedBankId,
    setSelectedBankId,
    games,
    questionCounts,
    newGameName,
    setNewGameName,
    newGameTheme,
    setNewGameTheme,
    isModalOpen,
    handleCreateGame,
    handleOpenGame,
    handleDeleteClick,
    handleCloseModal,
    handleConfirmDelete,
    getBankDisplayName
  };
}