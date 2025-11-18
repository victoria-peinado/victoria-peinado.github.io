// src/hooks/bank/useBankList.js
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { getQuestionBanks, deleteQuestionBank } from '../../services/bank/bankManagement';

export function useBankList({ currentUser, handleMessage }) {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionCounts, setQuestionCounts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState(null);

  const fetchBanks = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const fetchedBanks = await getQuestionBanks(currentUser.uid);
      setBanks(fetchedBanks);
      
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
  }, [currentUser, handleMessage]);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const handleUploadSuccess = useCallback(async () => {
    // Re-fetch only the question counts
    const counts = {};
    const fetchedBanks = await getQuestionBanks(currentUser.uid); // Re-fetch banks list
    setBanks(fetchedBanks); // Update banks list
    
    for (const bank of fetchedBanks) {
      const questionsRef = collection(db, `questionBanks/${bank.id}/questions`);
      const snapshot = await getDocs(questionsRef);
      counts[bank.id] = snapshot.size;
    }
    setQuestionCounts(counts);
  }, [currentUser, handleMessage]); // Added dependencies

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
      await deleteQuestionBank(bankToDelete.id);
      handleMessage('Bank successfully deleted', 'success');
      setBanks(banks.filter(b => b.id !== bankToDelete.id));
      // Also remove from question counts
      const newCounts = { ...questionCounts };
      delete newCounts[bankToDelete.id];
      setQuestionCounts(newCounts);
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      closeDeleteModal();
    }
  };

  return {
    banks,
    loading,
    questionCounts,
    isModalOpen,
    bankToDelete,
    fetchBanks, // Expose fetchBanks for the create hook
    handleUploadSuccess,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteConfirm,
    setBanks, // Expose setters for assembler hook
    setQuestionCounts, // Expose setters for assembler hook
  };
}