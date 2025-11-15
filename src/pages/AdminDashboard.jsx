import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as bankService from '../services/bankService';
import * as gameService from '../services/gameService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ConfirmModal from '../components/common/ConfirmModal'; // <-- 1. ADDED IMPORT

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [questionBanks, setQuestionBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [questionCounts, setQuestionCounts] = useState({});

  // --- 2. ADDED NEW STATE ---
  const [newGameName, setNewGameName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  const handleMessage = (text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  // Fetch question banks and their counts
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banks = await bankService.getQuestionBanks(currentUser.uid);
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
  }, [currentUser]);

  // Fetch games for admin
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const querySnapshot = await gameService.getGamesForAdmin(currentUser.uid);
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
  }, [currentUser]);

  // --- 3. ADDED DELETE HANDLERS ---
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
      await gameService.deleteGame(gameToDelete);
      setGames(games.filter(game => game.id !== gameToDelete));
      handleMessage('Game deleted successfully', 'success');
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting game:', error);
      handleMessage(error.message, 'error');
      handleCloseModal();
    }
  };

  // --- 4. UPDATED handleCreateGame ---
  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!newGameName) { // <-- Added check for game name
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
      // Pass newGameName to the service function
      const gameId = await gameService.createNewGame(currentUser.uid, selectedBankId, newGameName);
      handleMessage('Game created successfully!', 'success');
      setNewGameName(''); // <-- Clear the input on success
      navigate(`/admin/game/${gameId}`);
    } catch (error) {
      console.error('Error creating game:', error);
      handleMessage(error.message, 'error');
    }
  };

  const handleOpenGame = (gameId) => {
    navigate(`/admin/game/${gameId}`);
  };

  // const handleOpenStream = (gameId) => { // No longer used here
  //   window.open(`/stream/${gameId}`, '_blank');
  // };

  // Helper function to get bank display name (handles both old and new formats)
  const getBankDisplayName = (bank) => {
    const name = bank.name || bank.title || 'Untitled Bank';
    const count = questionCounts[bank.id] ?? 0;
    return `${name} (${count} questions)`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // --- 5. UPDATED JSX ---
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Signed in as: {currentUser.email}</p>
        </div>
        <Link
          to="/admin/banks"
          className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700"
        >
          Manage Question Banks
        </Link>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {/* Create New Game Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New Game</h2>
        
        {questionBanks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No question banks yet!</p>
            <Link
              to="/admin/banks"
              className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 inline-block"
            >
              Create Your First Question Bank
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCreateGame} className="flex flex-wrap gap-4 items-end">
            
            {/* --- ADDED GAME NAME INPUT --- */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="gameName" className="block text-sm font-medium text-gray-700 mb-2">
                Game Name
              </label>
              <input
                type="text"
                id="gameName"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                placeholder="e.g., Spring Trivia Night"
              />
            </div>
            
            {/* --- QUESTION BANK SELECTOR --- */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Question Bank
              </label>
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Choose a question bank...</option>
                {questionBanks.map(bank => (
                  <option key={bank.id} value={bank.id}>
                    {getBankDisplayName(bank)}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 h-11"
            >
              Create Game
            </button>
          </form>
        )}
      </div>

      {/* My Games Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">My Games</h2>
        
        {games.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No games created yet.</p>
        ) : (
          <div className="space-y-4">
            {games.map(game => {
              const bank = questionBanks.find(b => b.id === game.questionBankId);
              const bankName = bank ? (bank.name || bank.title || 'Unknown Bank') : 'Unknown Bank';
              
              return (
                <div key={game.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      {/* --- ADDED GAME NAME DISPLAY --- */}
                      <p className="font-bold text-lg">
                        {game.gameName || 'Untitled Game'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Game PIN: <span className="text-blue-600 font-semibold">{game.gamePin}</span>
                      </p>
                      <p className="text-sm text-gray-600">Bank: {bankName}</p>
                      <p className="text-sm text-gray-600">
                        State: <span className="capitalize">{game.state}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {game.createdAt?.toDate().toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenGame(game.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Manage
                      </button>
                      
                      {/* --- "Open Stream" BUTTON REMOVED --- */}
                      
                      {/* --- ADDED "Delete" BUTTON --- */}
                      <button
                        onClick={() => handleDeleteClick(game.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- ADDED THE MODAL COMPONENT --- */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Delete Game?"
        message="Are you sure you want to delete this game? This action cannot be undone and all player data will be lost."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}