import React, { useState } from 'react';
import * as bankService from '../../services/bankService';

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
      event.target.value = null;
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={isUploading}
        className="mb-4"
      />

      {message.text && (
        <div className={`mt-4 p-3 rounded ${
          message.type === 'error' 
            ? 'bg-red-100 text-red-700' 
            : message.type === 'success' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="text-sm text-gray-600 mt-4">
        <p className="font-semibold mb-2">CSV Format (semicolon-separated):</p>
        <code className="bg-gray-100 p-2 rounded block">
          question;answerA;answerB;answerC;answerD;correctLetter;duration
        </code>
        <p className="mt-2 text-xs">
          • Use semicolons (;) as delimiters<br/>
          • duration is in seconds (e.g., 30)<br/>
          • correctLetter must be A, B, C, or D
        </p>
      </div>
    </div>
  );
}