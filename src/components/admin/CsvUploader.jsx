// src/components/admin/CsvUploader.jsx
import React from 'react';
// UPDATED: Import the new hook
import { useCsvUploader } from '../../hooks/useCsvUploader';

export default function CsvUploader({ bankId, onUploadSuccess }) {
  // UPDATED: All logic is now contained in this single hook
  const { isUploading, message, handleFileChange } = useCsvUploader(
    bankId,
    onUploadSuccess
  );

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