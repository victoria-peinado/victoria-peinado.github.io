// src/hooks/admin/useAdminBankLoader.js
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // <-- FIX: 'from' instead of 'in'
import { getQuestionBanks } from '../../services/bank/bankManagement'; // <-- FIX: 'from' instead of 'in'

export function useAdminBankLoader({ currentUser, handleMessage }) {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [questionCounts, setQuestionCounts] = useState({});

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banks = await getQuestionBanks(currentUser.uid);
        setQuestionBanks(banks);
        const counts = {};
        for (const bank of banks) {
          try {
            const questionsRef = collection(
              db,
              `questionBanks/${bank.id}/questions`
            );
            const snapshot = await getDocs(questionsRef);
            counts[bank.id] = snapshot.size;
          } catch (error) {
            console.error(
              `Error fetching questions for bank ${bank.id}:`,
              error
            );
            counts[bank.id] = 0;
          }
        }
        setQuestionCounts(counts);
      } catch (error) {
        console.error('Error fetching banks:', error);
        handleMessage('Error loading question banks', 'error');
      }
    };
    if (currentUser) {
      fetchBanks();
    }
  }, [currentUser, handleMessage]);

  const getBankDisplayName = (bank) => {
    const name = bank.name || bank.title || 'Untitled Bank';
    const count = questionCounts[bank.id] ?? 0;
    return `${name} (${count} questions)`;
  };

  return { questionBanks, questionCounts, getBankDisplayName };
}