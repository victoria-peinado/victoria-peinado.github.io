// src/hooks/useCsvUploader.js
import { useState } from 'react';
// UPDATED: Import from the new bankQuestions service
import { handleCsvUpload } from '../services/bank/bankQuestions';

export function useCsvUploader(bankId, onUploadSuccess) {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleMessage = (text, type, duration = 4000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    handleMessage('Uploading and parsing CSV...', 'info');

    try {
      // UPDATED: Using the new service function
      const questionCount = await handleCsvUpload(file, bankId);
      handleMessage(`Successfully uploaded ${questionCount} questions!`, 'success');
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsUploading(false);
      event.target.value = null;
    }
  };

  return {
    isUploading,
    message,
    handleFileChange,
  };
}