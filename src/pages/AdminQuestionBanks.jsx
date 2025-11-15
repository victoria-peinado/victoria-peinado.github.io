import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as bankService from '../services/bankService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CsvUploader from '../components/admin/CsvUploader';
import ConfirmModal from '../components/common/ConfirmModal'; // [cite: 94]

export default function AdminQuestionBanks() {
  const { currentUser } = useAuth();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBankName, setNewBankName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [questionCounts, setQuestionCounts] = useState({});

  // --- New State for Delete Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState(null); // Stores {id, name}

  const handleMessage = (text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  // Fetch all question banks
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const fetchedBanks = await bankService.getQuestionBanks(currentUser.uid);
        setBanks(fetchedBanks);
        
        // Fetch question counts for each bank
        const counts = {};
        for (const bank of fetchedBanks) {
          const questionsRef = collection(db, `questionBanks/${bank.id}/questions`);
          const snapshot = await getDocs(questionsRef);
          counts[bank.id] = snapshot.size;
        }
        setQuestionCounts(counts);
      } catch (error) {
        handleMessage('Error loading question banks', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchBanks();
    }
  }, [currentUser]);

  const handleCreateBank = async (e) => {
    e.preventDefault();
    if (!newBankName.trim()) {
      handleMessage('Please enter a bank name', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const newBankId = await bankService.createNewBank(currentUser.uid, newBankName);
      handleMessage('Question bank created!', 'success');
      setNewBankName('');
      
      // Refresh banks list
      const fetchedBanks = await bankService.getQuestionBanks(currentUser.uid);
      setBanks(fetchedBanks);
      setQuestionCounts({ ...questionCounts, [newBankId]: 0 });
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadSuccess = async () => {
    // Refresh question counts after upload
    const counts = {};
    for (const bank of banks) {
      const questionsRef = collection(db, `questionBanks/${bank.id}/questions`);
      const snapshot = await getDocs(questionsRef);
      counts[bank.id] = snapshot.size;
    }
    setQuestionCounts(counts);
    setSelectedBankId(null);
  };

  // --- New Modal Handlers ---

  const openDeleteModal = (bank) => {
    setBankToDelete(bank);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setBankToDelete(null);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!bankToDelete) return;

    try {
      await bankService.deleteQuestionBank(bankToDelete.id); // [cite: 92]
      handleMessage('Bank successfully deleted', 'success');
      // Update state locally to remove the bank from the list
      setBanks(banks.filter(b => b.id !== bankToDelete.id));
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p>Loading question banks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/admin" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-8">My Question Banks</h1>

      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {/* Create New Bank Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New Bank</h2>
        <form onSubmit={handleCreateBank} className="flex gap-4">
          <input
            type="text"
            value={newBankName}
            onChange={(e) => setNewBankName(e.target.value)}
            placeholder="E.g., 'Movie Night Trivia'"
            className="flex-1 px-4 py-2 border rounded"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isCreating ? 'Creating...' : 'Create Bank'}
          </button>
        </form>
      </div>

      {/* CSV Upload Instructions (shown once) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        {/* ... (instructions unchanged) ... */}
      </div>

      {/* Question Banks List */}
      <div className="space-y-4">
        {banks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No question banks yet. Create one to get started!</p>
          </div>
        ) : (
          banks.map((bank) => (
            <div key={bank.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{bank.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Questions: {questionCounts[bank.id] || 0}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Bank ID: {bank.id}
                  </p>
                </div>
                
                {/* --- Updated Button Group --- */}
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                   to={`/admin-dashboard/bank/${bank.id}`} // [cite: 84]
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => openDeleteModal(bank)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedBankId(selectedBankId === bank.id ? null : bank.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    {selectedBankId === bank.id ? 'Cancel' : 'Upload CSV'}
                  </button>
                </div>
              </div>

              {/* CSV Uploader (only shown when selected) */}
              {selectedBankId === bank.id && (
                <div className="mt-4 border-t pt-4">
                  <CsvUploader bankId={bank.id} onUploadSuccess={handleUploadSuccess} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- Add Modal to the JSX --- */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Question Bank"
        message={`Are you sure you want to delete "${bankToDelete?.name}"? This will also delete all ${questionCounts[bankToDelete?.id] || 0} questions inside it. This action cannot be undone.`}
      />
    </div>
  );
}