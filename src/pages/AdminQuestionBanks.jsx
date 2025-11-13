import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import * as bankService from '../services/bankService';
import CsvUploader from '../components/admin/CsvUploader';
import LoadingScreen from '../components/common/LoadingScreen';

export default function AdminQuestionBanks() {
  const { currentUser } = useAuth();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBankTitle, setNewBankTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const q = query(
      collection(db, 'questionBanks'),
      where('ownerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const banksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanks(banksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching banks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleMessage = (text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const handleCreateBank = async (e) => {
    e.preventDefault();
    if (!newBankTitle.trim()) {
      handleMessage('Please enter a title', 'error');
      return;
    }

    setIsCreating(true);
    try {
      await bankService.createNewBank(currentUser.uid, newBankTitle.trim());
      handleMessage('Bank created successfully!', 'success');
      setNewBankTitle('');
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading question banks..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">My Question Banks</h1>
      
      {/* Create New Bank Form */}
      <form onSubmit={handleCreateBank} className="mb-8 p-6 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Create New Bank</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newBankTitle}
            onChange={(e) => setNewBankTitle(e.target.value)}
            placeholder="E.g., 'Movie Night Trivia'"
            className="flex-grow p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg"
          >
            {isCreating ? 'Creating...' : 'Create Bank'}
          </button>
        </div>
        {message.text && (
          <p className={`mt-2 text-sm ${
            message.type === 'success' ? 'text-green-400' : 'text-red-400'
          }`}>
            {message.text}
          </p>
        )}
      </form>

      {/* List of Existing Banks */}
      <div className="space-y-4">
        {banks.length === 0 ? (
          <p className="text-gray-400">You haven't created any question banks yet.</p>
        ) : (
          banks.map(bank => (
            <div key={bank.id} className="p-6 bg-gray-800 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-blue-400">{bank.title}</h3>
              <p className="text-gray-400">Questions: {bank.questionCount || 0}</p>
              <p className="text-sm text-gray-500">Bank ID: {bank.id}</p>
              
              <CsvUploader bankId={bank.id} onUploadSuccess={() => {}} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}