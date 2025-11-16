// src/hooks/useQuestionBankEditor.js
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
// UPDATED: Imports from new service locations
import { getBankDetails } from '../services/bank/bankManagement';
import {
  getQuestionsForBank,
  addQuestion,
  deleteQuestion,
  updateQuestion,
} from '../services/bank/bankQuestions';

// Helper: Initial state for the edit form
const initialEditForm = {
  question: '',
  answers: [
    { letter: 'A', text: '' },
    { letter: 'B', text: '' },
    { letter: 'C', text: '' },
    { letter: 'D', text: '' },
  ],
  correctLetter: 'A',
  duration: 30,
  id: null,
};

export function useQuestionBankEditor() {
  const { bankId } = useParams();
  const [bank, setBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // State for Add Question Form
  const [newQuestion, setNewQuestion] = useState('');
  const [ansA, setAnsA] = useState('');
  const [ansB, setAnsB] = useState('');
  const [ansC, setAnsC] = useState('');
  const [ansD, setAnsD] = useState('');
  const [correct, setCorrect] = useState('A');
  const [duration, setDuration] = useState(30);

  // State for Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // State for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);

  const handleMessage = (text, type, duration = 4000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  // Fetch bank details and questions on load
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // UPDATED: Using new service
      const bankDetails = await getBankDetails(bankId);
      // UPDATED: Using new service
      const bankQuestions = await getQuestionsForBank(bankId);
      setBank(bankDetails);
      setQuestions(bankQuestions);
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [bankId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Add Question Handlers ---
  const resetAddForm = () => {
    setNewQuestion('');
    setAnsA('');
    setAnsB('');
    setAnsC('');
    setAnsD('');
    setCorrect('A');
    setDuration(30);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion || !ansA || !ansB || !ansC || !ansD) {
      handleMessage('Please fill out all fields for the new question', 'error');
      return;
    }
    const questionData = {
      question: newQuestion.trim(),
      answers: [
        { letter: 'A', text: ansA.trim() },
        { letter: 'B', text: ansB.trim() },
        { letter: 'C', text: ansC.trim() },
        { letter: 'D', text: ansD.trim() },
      ],
      correctLetter: correct,
      duration: parseInt(duration, 10),
    };
    try {
      // UPDATED: Using new service
      await addQuestion(bankId, questionData);
      handleMessage('Question added successfully!', 'success');
      resetAddForm();
      loadData(); // Refresh the question list
    } catch (error) {
      handleMessage(error.message, 'error');
    }
  };

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
      // UPDATED: Using new service
      await deleteQuestion(bankId, questionToDelete.id);
      handleMessage('Question deleted', 'success');
      setQuestions(questions.filter((q) => q.id !== questionToDelete.id));
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      closeDeleteModal();
    }
  };

  // --- Edit Question Handlers ---
  const openEditModal = (question) => {
    setEditForm(question);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditForm(initialEditForm);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditAnswerChange = (index, value) => {
    const newAnswers = [...editForm.answers];
    newAnswers[index] = { ...newAnswers[index], text: value };
    setEditForm((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      const { id, ...dataToUpdate } = editForm;
      dataToUpdate.duration = parseInt(dataToUpdate.duration, 10);
      
      // UPDATED: Using new service
      await updateQuestion(bankId, id, dataToUpdate);
      handleMessage('Question updated successfully!', 'success');
      closeEditModal();
      loadData(); // Refresh the list
    } catch (error) {
      handleMessage(error.message, 'error');
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
    message,
    newQuestion, setNewQuestion,
    ansA, setAnsA,
    ansB, setAnsB,
    ansC, setAnsC,
    ansD, setAnsD,
    correct, setCorrect,
    duration, setDuration,
    isDeleteModalOpen,
    questionToDelete,
    isEditModalOpen,
    editForm,
    handleAddQuestion,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteConfirm,
    openEditModal,
    closeEditModal,
    handleEditChange,
    handleEditAnswerChange,
    handleUpdateQuestion,
    handleUploadSuccess
  };
}