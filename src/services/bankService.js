// src/services/bankService.js
import { collection, doc, getDocs, writeBatch, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Papa from 'papaparse';

/**
 * Creates a new question bank
 * @param {string} adminId - The admin's user ID
 * @param {string} bankName - Name of the question bank
 * @returns {Promise<string>} - The new bank's ID
 */
export async function createNewBank(adminId, bankName) {
  try {
    const bankRef = doc(collection(db, 'questionBanks'));
    
    await setDoc(bankRef, {
      name: bankName.trim(),
      ownerId: adminId, // Uses ownerId to match Firestore rules
      createdAt: serverTimestamp()
    });

    console.log('Question bank created:', bankRef.id);
    return bankRef.id;
  } catch (error) {
    console.error('Error creating question bank:', error);
    throw new Error('Failed to create question bank');
  }
}

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
          const requiredColumns = ['question', 'answerA', 'answerB', 'answerC', 'answerD', 'correctLetter', 'duration'];
          const headers = Object.keys(questions[0]);
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
          }

          // Upload questions to Firestore
          const batch = writeBatch(db);
          const questionsRef = collection(db, `questionBanks/${bankId}/questions`);

          questions.forEach((row, index) => {
            // Validate duration
            const duration = parseInt(row.duration);
            if (isNaN(duration) || duration <= 0) {
              console.warn(`Question ${index + 1}: Invalid duration "${row.duration}", defaulting to 30 seconds`);
            }

            const questionDoc = doc(questionsRef);
            batch.set(questionDoc, {
              question: row.question.trim(),
              answers: [
                { letter: 'A', text: row.answerA.trim() },
                { letter: 'B', text: row.answerB.trim() },
                { letter: 'C', text: row.answerC.trim() },
                { letter: 'D', text: row.answerD.trim() }
              ],
              correctLetter: row.correctLetter.toUpperCase().trim(),
              duration: isNaN(duration) ? 30 : duration, // Store duration per question
              createdAt: serverTimestamp()
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
      }
    });
  });
}

/**
 * Fetches all question banks for an admin
 * @param {string} adminId - The admin's user ID (optional for now)
 * @returns {Promise<Array>} - Array of question banks
 */
export async function getQuestionBanks(adminId) {
  try {
    const banksRef = collection(db, 'questionBanks');
    const snapshot = await getDocs(banksRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching question banks:', error);
    throw new Error('Failed to fetch question banks');
  }
}