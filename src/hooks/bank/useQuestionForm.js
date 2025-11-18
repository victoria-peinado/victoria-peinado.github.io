// src/hooks/bank/useQuestionForm.js
import { useState } from 'react';
import { addQuestion, updateQuestion } from '../../services/bank/bankQuestions';

// This is the single source of truth for a question's structure
const BLANK_QUESTION_FORM = {
  question: '',
  answers: [
    { letter: 'A', text: '' },
    { letter: 'B', text: '' },
    { letter: 'C', text: '' },
    { letter: 'D', text: '' },
  ],
  correctLetter: 'A',
  duration: 30,
  id: null, // id is null for a new question
};

export function useQuestionForm({ bankId, handleMessage, onFormSuccess }) {
  // State for the "Add Question" form
  const [addFormState, setAddFormState] = useState(BLANK_QUESTION_FORM);

  // State for the "Edit Question" modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormState, setEditFormState] = useState(BLANK_QUESTION_FORM);

  // --- Add Question Handlers ---
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const { question, answers, correctLetter, duration } = addFormState;
    if (!question || answers.some(a => !a.text)) {
      handleMessage('Please fill out all fields for the new question', 'error');
      return;
    }
    const questionData = {
      question: question.trim(),
      answers: answers.map(a => ({ ...a, text: a.text.trim() })),
      correctLetter,
      duration: parseInt(duration, 10),
    };

    try {
      await addQuestion(bankId, questionData);
      handleMessage('Question added successfully!', 'success');
      setAddFormState(BLANK_QUESTION_FORM); // Reset form
      onFormSuccess(); // Call the success callback
    } catch (error) {
      handleMessage(error.message, 'error');
    }
  };

  // --- Edit Question Handlers ---
  const openEditModal = (question) => {
    setEditFormState(question);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditFormState(BLANK_QUESTION_FORM);
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      const { id, ...dataToUpdate } = editFormState;
      dataToUpdate.duration = parseInt(dataToUpdate.duration, 10);
      
      await updateQuestion(bankId, id, dataToUpdate);
      handleMessage('Question updated successfully!', 'success');
      closeEditModal();
      onFormSuccess(); // Call the success callback
    } catch (error) {
      handleMessage(error.message, 'error');
    }
  };

  return {
    // Add Form props
    addFormState,
    setAddFormState,
    handleAddQuestion,
    
    // Edit Modal props
    isEditModalOpen,
    editFormState,
    setEditFormState,
    openEditModal,
    closeEditModal,
    handleUpdateQuestion,
  };
}