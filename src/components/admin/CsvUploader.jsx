import React, { useState } from 'react';
import * as bankService from '../../services/bankService'; // <-- This is the fix

export default function CsvUploader({ bankId, onUploadSuccess }) {
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
      const questionCount = await bankService.handleCsvUpload(file, bankId);
      handleMessage(`Successfully uploaded ${questionCount} questions!`, 'success');
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = null;
    }
  };

  return (
    <div className="mt-4">
      <label
        htmlFor={`csv-upload-${bankId}`}
        className={`inline-block font-bold py-2 px-4 rounded-lg ${
          isUploading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload Questions (CSV)'}
      </label>
      <input
        type="file"
        id={`csv-upload-${bankId}`}
        accept=".csv"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />
      
      {message.text && (
        <p className={`mt-2 text-sm ${
          message.type === 'success' ? 'text-green-400' : 'text-red-400'
        }`}>
          {message.text}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-2">
        CSV Columns: question, answerA, answerB, answerC, answerD, correctLetter, duration
      </p>
    </div>
  );
}