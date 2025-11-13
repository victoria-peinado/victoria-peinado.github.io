// src/services/authService.js
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

/**
 * Creates a new user account with email and password.
 */
export const signup = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
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