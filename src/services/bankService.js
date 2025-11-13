import { db } from '../firebase';
import { collection, doc, setDoc, serverTimestamp, addDoc, writeBatch } from 'firebase/firestore';
import Papa from 'papaparse'; // You'll need to run: npm install papaparse

/**
 * Creates a new, empty question bank for the user.
 */
export const createNewBank = async (userId, title) => {
  if (!userId || !title) {
    throw new Error('User ID and title are required.');
  }
  try {
    const bankRef = collection(db, 'questionBanks');
    await addDoc(bankRef, {
      ownerId: userId,
      title: title,
      createdAt: serverTimestamp(),
      questionCount: 0
    });
  } catch (error) {
    console.error("Error creating new bank:", error);
    throw new Error('Failed to create question bank.');
  }
};

/**
 * Parses a CSV file and uploads questions to a bank.
 * @param {File} file - The CSV file from an <input>
 * @param {string} bankId - The ID of the bank to upload to.
 * @returns {Promise<number>} - The number of questions successfully uploaded.
 */
export const handleCsvUpload = (file, bankId) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const questions = results.data;
        if (!questions || questions.length === 0) {
          return reject(new Error('CSV file is empty or invalid.'));
        }

        try {
          // Use a batch write to upload all questions atomically
          const batch = writeBatch(db);
          const questionsRef = collection(db, `questionBanks/${bankId}/questions`);

          let questionCount = 0;
          questions.forEach((q, index) => {
            // Basic validation
            if (!q.question || !q.answerA || !q.answerB || !q.answerC || !q.answerD || !q.correctLetter || !q.duration) {
              console.warn(`Skipping malformed row ${index + 2}:`, q);
              return;
            }

            const newQuestionRef = doc(questionsRef);
            batch.set(newQuestionRef, {
              question: q.question.trim(),
              // Format answers into an array of objects
              answers: [
                { letter: 'A', text: q.answerA.trim() },
                { letter: 'B', text: q.answerB.trim() },
                { letter: 'C', text: q.answerC.trim() },
                { letter: 'D', text: q.answerD.trim() }
              ],
              correctLetter: q.correctLetter.trim().toUpperCase(),
              duration: parseInt(q.duration, 10) || 30 // Default 30s
            });
            questionCount++;
          });

          if (questionCount === 0) {
            return reject(new Error('No valid questions found in CSV.'));
          }

          // Update the bank's question count
          const bankRef = doc(db, 'questionBanks', bankId);
          batch.update(bankRef, { questionCount });

          await batch.commit();
          resolve(questionCount);

        } catch (error) {
          console.error("Error uploading questions:", error);
          reject(new Error('Failed to upload questions to database.'));
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        reject(new Error('Failed to parse CSV file.'));
      }
    });
  });
};