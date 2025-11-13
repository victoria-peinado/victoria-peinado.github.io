import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import * as gameService from '../services/gameService';
import LoadingScreen from '../components/common/LoadingScreen';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  // Listen to the user's game sessions
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const q = query(
      collection(db, 'gameSessions'),
      where('adminId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gamesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching games:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCreateNewGame = async () => {
    setIsCreating(true);
    try {
      // We'll update this in Sprint 2 to ask for a question bank
      const newGameId = await gameService.createNewGame(currentUser.uid, null);
      handleMessage('Game created successfully!', 'success');
      navigate(`/admin/game/${newGameId}`);
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Simple message handler for now
  const handleMessage = (text, type) => {
    console.log(`[${type}]: ${text}`);
  };

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <div>
          <Link
            to="/admin/questions"
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-5 rounded-lg mr-4"
          >
            My Question Banks
          </Link>
          <button
            onClick={handleCreateNewGame}
            disabled={isCreating}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg"
          >
            {isCreating ? 'Creating...' : 'Create New Game'}
          </button>
        </div>
      </div>

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
                <h3 className="text-xl font-bold text-blue-400">Game ID: {game.id}</h3>
                <p className="text-gray-300">State: {game.state}</p>
                <p className="text-sm text-gray-500">
                  Created: {game.createdAt?.toDate().toLocaleString()}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}