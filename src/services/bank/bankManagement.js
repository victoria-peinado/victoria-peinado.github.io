// src/services/bank/bankManagement.js
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';

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
      createdAt: serverTimestamp(),
    });

    console.log('Question bank created:', bankRef.id);
    return bankRef.id;
  } catch (error) {
    console.error('Error creating question bank:', error);
    throw new Error('Failed to create question bank');
  }
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
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching question banks:', error);
    throw new Error('Failed to fetch question banks');
  }
}

/**
 * Deletes a question bank AND all its questions.
 * This is crucial as deleting a doc does not delete its subcollections.
 * @param {string} bankId - The ID of the question bank to delete
 */
export async function deleteQuestionBank(bankId) {
  try {
    const batch = writeBatch(db);

    // 1. Get all questions in the subcollection
    const questionsRef = collection(db, `questionBanks/${bankId}/questions`);
    const questionsSnapshot = await getDocs(questionsRef);

    // 2. Add all question deletions to the batch
    questionsSnapshot.docs.forEach((questionDoc) => {
      batch.delete(questionDoc.ref);
    });

    // 3. Add the main bank doc deletion to the batch
    const bankRef = doc(db, 'questionBanks', bankId);
    batch.delete(bankRef);

    // 4. Commit the batch
    await batch.commit();
    console.log(`Successfully deleted bank ${bankId} and all its questions.`);
  } catch (error) {
    console.error(`Error deleting question bank ${bankId}:`, error);
    throw new Error('Failed to delete question bank.');
  }
}

/**
 * Fetches the details for a single question bank.
 * @param {string} bankId - The ID of the bank
 * @returns {Promise<object>} - The bank's data
 */
export async function getBankDetails(bankId) {
  try {
    const bankRef = doc(db, 'questionBanks', bankId);
    const bankSnap = await getDoc(bankRef);

    if (!bankSnap.exists()) {
      throw new Error('Question bank not found');
    }
    return { id: bankSnap.id, ...bankSnap.data() };
  } catch (error) {
    console.error(`Error fetching bank details ${bankId}:`, error);
    throw new Error('Failed to fetch bank details.');
  }
}