// src/components/common/ConfirmModal.jsx
import React from 'react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger" // 'danger' or 'primary'
}) {
  if (!isOpen) return null;

  const confirmColorClasses = confirmVariant === 'danger' 
    ? "bg-red-600 hover:bg-red-700" 
    : "bg-blue-600 hover:bg-blue-700";

  return (
    // Modal Overlay
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-gray-800 text-white w-full max-w-md p-6 rounded-2xl shadow-2xl border border-gray-700 z-50"
        onClick={(e) => e.stopPropagation()} // Prevent closing on content click
      >
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white font-semibold transition ${confirmColorClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}