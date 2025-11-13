import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

/**
 * Fetches all questions for a given question bank
 * @param {string} questionBankId - The ID of the question bank to fetch.
 */
export function useQuestionBank(questionBankId) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!questionBankId) {
      setLoading(false);
      // Not an error, just no bank selected
      setQuestions([]);
      return;
    }

    setLoading(true);
    const questionsRef = collection(db, `questionBanks/${questionBankId}/questions`);
    const q = query(questionsRef); // Can add orderBy here later if needed

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions for this bank.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [questionBankId]);

  return { questions, loading, error };
}