// src/hooks/useAdminQuestionBanks.js
import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBankList } from './bank/useBankList';
import { useCreateBank } from './bank/useCreateBank';

export function useAdminQuestionBanks() {
  const { currentUser } = useAuth();
  
  // Keep the message state here in the assembler
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedBankId, setSelectedBankId] = useState(null);

  const handleMessage = useCallback((text, type, duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  }, []);

  const bankList = useBankList({ currentUser, handleMessage });

  const onBankCreated = (newBank) => {
    bankList.setBanks([...bankList.banks, newBank]);
    bankList.setQuestionCounts({ ...bankList.questionCounts, [newBank.id]: 0 });
  };

  const createBank = useCreateBank({ 
    currentUser, 
    handleMessage, 
    onBankCreated 
  });

  const handleUploadSuccess = async () => {
    await bankList.handleUploadSuccess();
    setSelectedBankId(null);
  };

  return {
    ...bankList,
    ...createBank,
    message,
    selectedBankId,
    setSelectedBankId,
    handleUploadSuccess,
  };
}