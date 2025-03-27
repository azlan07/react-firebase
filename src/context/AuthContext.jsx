import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth, database } from '../firebase/config';
import { ref, set, get } from 'firebase/database';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  async function signup(email, password, role = 'user') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store user role in database
      await set(ref(database, `users/${user.uid}`), {
        email: user.email,
        role: role,
        createdAt: new Date().toISOString()
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user role from database
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserRole(snapshot.val().role);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      
      // Check if running on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Use redirect for mobile devices
        await signInWithRedirect(auth, provider);
        return null; // Will be handled by useEffect
      } else {
        // Use popup for desktop
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await handleGoogleUser(user);
        return user;
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Helper function to handle Google user data
  async function handleGoogleUser(user) {
    // Check if user exists in database
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      // If new user, create entry with default role
      await set(userRef, {
        email: user.email,
        role: 'user',
        createdAt: new Date().toISOString()
      });
      setUserRole('user');
    } else {
      setUserRole(snapshot.val().role);
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch user role
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserRole(snapshot.val().role);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    // Handle redirect result
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await handleGoogleUser(result.user);
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', error);
      });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}