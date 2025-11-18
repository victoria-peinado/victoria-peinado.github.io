// src/hooks/useQuestionBankEditor.js
import { useState, useCallback } from 'react';
import { useQuestionList } from './bank/useQuestionList';
import { useQuestionForm } from './bank/useQuestionForm';

export function useQuestionBankEditor() {
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleMessage = useCallback((text, type, duration = 4000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  }, []);

  // Hook for fetching list and delete logic
  const list = useQuestionList({ handleMessage });

  // Hook for add/edit form logic
  const forms = useQuestionForm({ 
    handleMessage, 
    bankId: list.bankId, 
    onFormSuccess: list.loadData // Pass loadData as the success callback
  });

  return {
    message,
    ...list,  // Spreads bankId, bank, questions, loading, delete handlers, etc.
    ...forms, // Spreads all add/edit form state and handlers
  };
}