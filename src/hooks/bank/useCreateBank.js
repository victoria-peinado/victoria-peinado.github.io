// src/hooks/bank/useCreateBank.js
import { useState } from 'react';
import { createNewBank } from '../../services/bank/bankManagement';

export function useCreateBank({ currentUser, handleMessage, onBankCreated }) {
  const [newBankName, setNewBankName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBank = async (e) => {
    e.preventDefault();
    if (!newBankName.trim()) {
      handleMessage('Please enter a bank name', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const newBankId = await createNewBank(currentUser.uid, newBankName);
      handleMessage('Question bank created!', 'success');
      
      // Call the callback to update the parent's state
      onBankCreated({ 
        id: newBankId, 
        name: newBankName, 
        ownerId: currentUser.uid 
      });
      
      setNewBankName('');
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return {
    newBankName,
    setNewBankName,
    isCreating,
    handleCreateBank,
  };
}