// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
// SPRINT 14: Import all firestore functions we use
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc, // <-- THIS WAS THE MISSING IMPORT
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  increment,
  query,
  where,
  limit,
  arrayUnion,
  arrayRemove,
  // ADDED FOR PROFILE PAGE
  orderBy,
  startAfter,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase initialized:', app.name);

// SPRINT 14: Export app, analytics, auth, db, AND all firestore functions
export {
  app,
  analytics,
  auth,
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc, // <-- THIS WAS THE MISSING EXPORT
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  increment,
  query,
  where,
  limit,
  arrayUnion,
  arrayRemove,
  // ADDED FOR PROFILE PAGE
  orderBy,
  startAfter,
};