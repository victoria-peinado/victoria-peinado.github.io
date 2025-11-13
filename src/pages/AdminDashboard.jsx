import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // Removed orderBy
import { useAuth } from '../contexts/AuthContext';
import * as gameService from '../services/gameService';
import LoadingScreen from '../components/common/LoadingScreen';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [games, setGames] = useState([]);
  const [banks, setBanks] = useState([]); // <-- SPRINT 2: Add state for banks
  const [selectedBankId, setSelectedBankId] = useState(''); // <-- SPRINT 2: Add state for dropdown
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingBanks, setLoadingBanks] = useState(true); // <-- SPRINT 2: Add separate loading state
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // <-- Add message state
  const navigate = useNavigate();

  // Listen to the user's game sessions
  useEffect(() => {
    if (!currentUser) return;

    setLoadingGames(true);
    const q = query(
      collection(db, 'gameSessions'),
      where('adminId', '==', currentUser.uid)
    );
    // Note: Removed orderBy('createdAt', 'desc') as it requires a composite index.
    // Sorting can be done client-side if needed.

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gamesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client-side to avoid index requirement
      gamesData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setGames(gamesData);
      setLoadingGames(false);
    }, (error) => {
      console.error("Error fetching games:", error);
      setLoadingGames(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // SPRINT 2: Listen to the user's question banks
  useEffect(() => {
    if (!currentUser) return;

    setLoadingBanks(true);
    const q = query(
      collection(db, 'questionBanks'),
      where('ownerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const banksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanks(banksData);
      if (banksData.length > 0) {
        setSelectedBankId(banksData[0].id); // Default to first bank
      }
      setLoadingBanks(false);
    }, (error) => {
      console.error("Error fetching banks:", error);
      setLoadingBanks(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Updated message handler
  const handleMessage = (text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  // SPRINT 2: Updated function to use selected bank
  const handleCreateNewGame = async (e) => {
    e.preventDefault(); // It's a form now
    if (!selectedBankId) {
      handleMessage('Please select a question bank first.', 'error');
      return;
    }

    setIsCreating(true);
    try {
      // Pass the selected question bank ID to the service
      const newGameId = await gameService.createNewGame(currentUser.uid, selectedBankId);
      handleMessage('Game created successfully!', 'success', 1500);
      navigate(`/admin/game/${newGameId}`);
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const loading = loadingGames || loadingBanks; // Page is loading if either is loading

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Status Message */}
      {message.text && (
        <div className={`max-w-4xl mx-auto mb-4 p-4 rounded-lg text-center font-semibold ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <Link
          to="/admin/questions"
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-5 rounded-lg"
        >
          My Question Banks
        </Link>
      </div>

      {/* SPRINT 2: Create New Game Form */}
      <form onSubmit={handleCreateNewGame} className="mb-8 p-6 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Create New Game</h2>
        {banks.length === 0 ? (
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <p className="text-lg text-gray-300">You must create a question bank before you can create a game.</p>
            <Link
              to="/admin/questions"
              className="mt-4 inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Create a Bank
            </Link>
          </div>
        ) : (
          <div className="flex gap-4">
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
            >
              {banks.map(bank => (
                <option key={bank.id} value={bank.id}>
                  {bank.title} ({bank.questionCount || 0} questions)
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isCreating || !selectedBankId}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg disabled:bg-gray-500"
            >
              {isCreating ? 'Creating...' : 'Create New Game'}
            </button>
          </div>
        )}
      </form>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">My Games</h2>
        <div className="space-y-4">
          {games.length === 0 ? (
            <p className="text-gray-400">You haven't created any games yet.</p>
          ) : (
            games.map(game => (
              <Link
                key={game.id}
                to={`/admin/game/${game.id}`}
                className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-blue-400">
                      Game PIN: <span className="tracking-widest">{game.gamePin}</span>
                    </h3>
                    <p className="text-sm text-gray-500">Bank: {banks.find(b => b.id === game.questionBankId)?.title || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 font-semibold uppercase">{game.state}</p>
                    <p className="text-sm text-gray-500">
                      {game.createdAt?.toDate().toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}