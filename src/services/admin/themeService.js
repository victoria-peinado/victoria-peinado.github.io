// src/services/admin/themeService.js
import { db } from '../../firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  updateDoc, // <-- NEW: Added updateDoc import
} from '../../firebase'; // <-- UPDATED: Import from firebase.js

/**
 * Fetches all theme presets for a specific admin user, ordered by name.
 * @param {string} adminId - The UID of the admin user.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of preset objects.
 */
export const getThemePresets = async (adminId) => {
  if (!adminId) return [];

  try {
    const presetsCollectionRef = collection(
      db,
      'users',
      adminId,
      'themePresets'
    );
    const q = query(presetsCollectionRef, orderBy('name')); // Order by name for a clean list
    const querySnapshot = await getDocs(q);

    const presets = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return presets;
  } catch (error) {
    console.error('Error fetching theme presets:', error);
    throw new Error('Could not fetch theme presets.');
  }
};

/**
 * Saves a new theme preset to the admin's collection.
 * @param {string} adminId - The UID of the admin user.
 * @param {string} presetName - The name for the new preset.
 * @param {Object} themeData - The object containing the custom color values.
 * @returns {Promise<Object>} A promise that resolves to the new preset document.
 */
export const saveThemePreset = async (adminId, presetName, themeData) => {
  if (!adminId || !presetName || !themeData) {
    throw new Error('Invalid data for saving preset.');
  }

  try {
    const presetsCollectionRef = collection(
      db,
      'users',
      adminId,
      'themePresets'
    );
    const newPresetDoc = await addDoc(presetsCollectionRef, {
      name: presetName,
      themeData: themeData,
    });
    return { id: newPresetDoc.id, name: presetName, themeData };
  } catch (error) {
    console.error('Error saving theme preset:', error);
    throw new Error('Could not save theme preset.');
  }
};

/**
 * --- NEW: SPRINT 14 ---
 * Updates an existing theme preset in the admin's collection.
 * @param {string} adminId - The UID of the admin user.
 * @param {string} presetId - The document ID of the preset to update.
 * @param {string} presetName - The new name for the preset.
 * @param {Object} themeData - The new object of custom color values.
 */
export const updateThemePreset = async (
  adminId,
  presetId,
  presetName,
  themeData
) => {
  if (!adminId || !presetId || !presetName || !themeData) {
    throw new Error('Invalid data for updating preset.');
  }

  try {
    const presetDocRef = doc(
      db,
      'users',
      adminId,
      'themePresets',
      presetId
    );
    await updateDoc(presetDocRef, {
      name: presetName,
      themeData: themeData,
    });
  } catch (error) {
    console.error('Error updating theme preset:', error);
    throw new Error('Could not update theme preset.');
  }
};
/**
 * --- END NEW ---
 */

/**
 * Deletes a theme preset from the admin's collection.
 * @param {string} adminId - The UID of the admin user.
 * @param {string} presetId - The document ID of the preset to delete.
 */
export const deleteThemePreset = async (adminId, presetId) => {
  if (!adminId || !presetId) {
    throw new Error('Invalid IDs for deleting preset.');
  }

  try {
    const presetDocRef = doc(
      db,
      'users',
      adminId,
      'themePresets',
      presetId
    );
    await deleteDoc(presetDocRef);
  } catch (error) {
    console.error('Error deleting theme preset:', error);
    throw new Error('Could not delete theme preset.');
  }
};