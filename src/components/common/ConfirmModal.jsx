// src/components/common/ConfirmModal.jsx
import React from 'react';
import { Modal } from '../ui/Modal'; // Import the new base Modal
import { Button } from '../ui/Button'; // Import the new Button

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
  
  // We no longer need this! Our <Button> component handles 'danger'
  // and 'primary' variants automatically.
  // const confirmColorClasses = ...

  // isOpen logic is now handled inside the <Modal> component
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {/* The modal's content goes here */}
      <p className="text-neutral-200 mb-6">{message}</p>
      
      <div className="flex justify-end gap-4">
        {/* Use the "neutral" variant for the cancel button */}
        <Button
          onClick={onClose}
          variant="neutral"
        >
          {cancelText}
        </Button>
        
        {/* Pass the confirmVariant ('danger' or 'primary') directly
            to our new Button component */}
        <Button
          onClick={onConfirm}
          variant={confirmVariant}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}