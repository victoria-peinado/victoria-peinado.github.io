// src/services/bank/bankQuestions.js
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
  deleteDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import Papa from 'papaparse';

/**
 * Handles CSV upload and parses questions into Firestore
 * @param {File} file - The CSV file
 * @param {string} bankId - The question bank ID
 * @returns {Promise<number>} - Number of questions uploaded
 */
export async function handleCsvUpload(file, bankId) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      delimiter: ';', // Semicolon delimiter
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const questions = results.data;

          if (questions.length === 0) {
            throw new Error('CSV file is empty');
          }

          // Validate CSV headers
          const requiredColumns = [
            'question',
            'answerA',
            'answerB',
            'answerC',
            'answerD',
            'correctLetter',
            'duration',
          ];
          const headers = Object.keys(questions[0]);
          const missingColumns = requiredColumns.filter(
            (col) => !headers.includes(col)
          );

          if (missingColumns.length > 0) {
            throw new Error(
              `Missing required columns: ${missingColumns.join(', ')}`
            );
          }

          // Upload questions to Firestore
          const batch = writeBatch(db);
          const questionsRef = collection(
            db,
            `questionBanks/${bankId}/questions`
          );

          questions.forEach((row, index) => {
            // Validate duration
            const duration = parseInt(row.duration);
            if (isNaN(duration) || duration <= 0) {
              console.warn(
                `Question ${index + 1}: Invalid duration "${
                  row.duration
                }", defaulting to 30 seconds`
              );
            }

            const questionDoc = doc(questionsRef);
            batch.set(questionDoc, {
              question: row.question.trim(),
              answers: [
                { letter: 'A', text: row.answerA.trim() },
                { letter: 'B', text: row.answerB.trim() },
                { letter: 'C', text: row.answerC.trim() },
                { letter: 'D', text: row.answerD.trim() },
              ],
              correctLetter: row.correctLetter.toUpperCase().trim(),
              duration: isNaN(duration) ? 30 : duration, // Store duration per question
              createdAt: serverTimestamp(),
            });
          });

          await batch.commit();
          console.log(`Successfully uploaded ${questions.length} questions`);
          resolve(questions.length);
        } catch (error) {
          console.error('Error uploading CSV:', error);
          reject(error);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        reject(new Error('Failed to parse CSV file'));
      },
    });
  });
}

/**
 * Adds a new question to a specific bank.
 * @param {string} bankId - The ID of the bank
 * @param {object} questionData - The question object
 * @returns {Promise<string>} - The new question's ID
 */
export async function addQuestion(bankId, questionData) {
  try {
    const questionsRef = collection(db, `questionBanks/${bankId}/questions`);
    // Add the question and include a server timestamp
    const docRef = await addDoc(questionsRef, {
      ...questionData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding question to bank ${bankId}:`, error);
    throw new Error('Failed to add question.');
  }
}

/**
 * Updates a specific question in a bank.
 * @param {string} bankId - The ID of the bank
 * @param {string} questionId - The ID of the question
 * @param {object} updatedData - The data to update
 */
export async function updateQuestion(bankId, questionId, updatedData) {
  try {
    const questionRef = doc(db, `questionBanks/${bankId}/questions`, questionId);
    await updateDoc(questionRef, updatedData);
  } catch (error)
 {
    console.error(`Error updating question ${questionId}:`, error);
    throw new Error('Failed to update question.');
  }
}

/**
 * Deletes a specific question from a bank.
 * @param {string} bankId - The ID of the bank
 * @param {string} questionId - The ID of the question
 */
export async function deleteQuestion(bankId, questionId) {
  try {
    const questionRef = doc(db, `questionBanks/${bankId}/questions`, questionId);
    await deleteDoc(questionRef);
  } catch (error) {
    console.error(`Error deleting question ${questionId}:`, error);
    throw new Error('Failed to delete question.');
  }
}

/**
 * Fetches all questions for a specific bank, ordered by creation time.
 * @param {string} bankId - The ID of the bank
 * @returns {Promise<Array>} - Array of question objects
 */
export async function getQuestionsForBank(bankId) {
  try {
    const questionsRef = collection(db, `questionBanks/${bankId}/questions`);
    const q = query(questionsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching questions for bank ${bankId}:`, error);
    throw new Error('Failed to fetch questions.');
  }
}