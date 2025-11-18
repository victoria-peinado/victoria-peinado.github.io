// src/services/authService.js
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously as firebaseSignInAnonymously, // 1. RENAME the imported function
} from 'firebase/auth';
// SPRINT 14: Import the new createProfile function
import { createProfile } from './player/profileService';

/**
 * Creates a new user account with email and password.
 * SPRINT 14: Also creates a corresponding user profile document.
 */
export const signup = async (email, password) => {
  try {
    // 1. Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { user } = userCredential;

    // 2. Create the permanent profile in Firestore
    if (user) {
      // Create a default display name from the email
      const defaultDisplayName = email.split('@')[0];
      await createProfile(user.uid, user.email, defaultDisplayName);
    }

    // 3. Return the auth credential
    return userCredential;
  } catch (error) {
    // Handle errors (e.g., email already in use)
    console.error('Error during signup:', error);
    throw error;
  }
};

/**
 * Signs in an existing user with email and password.
 */
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Signs out the current user.
 */
export const logout = () => {
  return signOut(auth);
};

/**
 * Listens to Firebase auth state changes.
 * @param {function} callback - The function to call when auth state changes.
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * NEW: Sends a password reset email to the given email address.
 *
 */
export const sendPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

/**
 * 2. NEW: Signs in the user anonymously.
 * This will create a temporary user in Firebase Auth.
 */
export const signInAnonymously = () => {
  // 3. Call the renamed Firebase function
  return firebaseSignInAnonymously(auth);
};