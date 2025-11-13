// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../services/authService';
import { db } from '../firebase'; // <-- Import Firestore db
import { doc, getDoc } from 'firebase/firestore'; // <-- Import doc/getDoc

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // <-- NEW: Add admin state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // User is logged in, check if they are an admin
        try {
          const userDocRef = doc(db, 'users', user.uid); // <-- Check 'users' collection
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().isAdmin === true) {
            setIsAdmin(true); // <-- They are an admin!
          } else {
            setIsAdmin(false); // <-- They are a regular user
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setIsAdmin(false);
        }
      } else {
        // User is logged out, not an admin
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAdmin, // <-- NEW: Provide admin state
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};