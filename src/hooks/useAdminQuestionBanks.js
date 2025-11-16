// src/hooks/useAdminQuestionBanks.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
// UPDATED: Imports from new service location
import { getQuestionBanks, createNewBank, deleteQuestionBank } from '../services/bank/bankManagement';

export function useAdminQuestionBanks() {
  const { currentUser } = useAuth();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBankName, setNewBankName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [questionCounts, setQuestionCounts] = useState({});

  // State for Delete Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState(null);

  const handleMessage = (text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const fetchBanks = async () => {
    try {
      // UPDATED: Using new service
      const fetchedBanks = await getQuestionBanks(currentUser.uid);
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

  // Fetch all question banks on load
  useEffect(() => {
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
      // UPDATED: Using new service
      const newBankId = await createNewBank(currentUser.uid, newBankName);
      handleMessage('Question bank created!', 'success');
      setNewBankName('');
      
      // Refresh banks list
      // We can just add the new bank locally to avoid a full re-fetch
      setBanks([...banks, { id: newBankId, name: newBankName, ownerId: currentUser.uid }]);
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
      // UPDATED: Using new service
      await deleteQuestionBank(bankToDelete.id);
      handleMessage('Bank successfully deleted', 'success');
      setBanks(banks.filter(b => b.id !== bankToDelete.id));
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      closeDeleteModal();
    }
  };

  return {
    banks,
    loading,
    newBankName,
    setNewBankName,
    isCreating,
    message,
    selectedBankId,
    setSelectedBankId,
    questionCounts,
    isModalOpen,
    bankToDelete,
    handleCreateBank,
    handleUploadSuccess,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteConfirm
  };
}