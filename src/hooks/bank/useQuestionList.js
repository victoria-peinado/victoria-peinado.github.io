// src/hooks/bank/useQuestionList.js
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getBankDetails } from '../../services/bank/bankManagement';
import {
  getQuestionsForBank,
  deleteQuestion,
} from '../../services/bank/bankQuestions';

export function useQuestionList({ handleMessage }) {
  const { bankId } = useParams();
  const [bank, setBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const bankDetails = await getBankDetails(bankId);
      const bankQuestions = await getQuestionsForBank(bankId);
      setBank(bankDetails);
      setQuestions(bankQuestions);
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [bankId, handleMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Delete Question Handlers ---
  const openDeleteModal = (question) => {
    setQuestionToDelete(question);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setQuestionToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!questionToDelete) return;
    try {
      await deleteQuestion(bankId, questionToDelete.id);
      handleMessage('Question deleted', 'success');
      setQuestions(questions.filter((q) => q.id !== questionToDelete.id));
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      closeDeleteModal();
    }
  };
  
  // --- CSV Upload Handler ---
  const handleUploadSuccess = () => {
    handleMessage('CSV uploaded successfully! Refreshing questions...', 'success');
    loadData(); // Refresh list after CSV upload
  };

  return {
    bankId,
    bank,
    questions,
    loading,
    loadData, // Expose for form success
    isDeleteModalOpen,
    questionToDelete,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteConfirm,
    handleUploadSuccess,
  };
}