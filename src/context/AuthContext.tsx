'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithUsername: (username: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync user profile to Firestore
  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);
      const username = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Gamer';

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: username.toLowerCase(),
          displayName: username,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      } else {
        await setDoc(
          userRef,
          {
            lastLoginAt: serverTimestamp(),
            username: username.toLowerCase(),
          },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn('Could not sync user profile to Firestore:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithUsername = async (usernameInput: string, pass: string) => {
    setError(null);
    const clean = usernameInput.trim().toLowerCase();

    if (!clean || !pass) {
      const msg = 'Introduce tu usuario y contraseña';
      setError(msg);
      throw new Error(msg);
    }

    let emailToTry = clean;

    // Si el usuario no ha puesto una arroba, buscar su email asociado o usar el dominio @dawgaming.app
    if (!clean.includes('@')) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', clean));
        const snap = await getDocs(q);
        if (!snap.empty && snap.docs[0].data()?.email) {
          emailToTry = snap.docs[0].data().email;
        } else {
          emailToTry = `${clean}@dawgaming.app`;
        }
      } catch {
        emailToTry = `${clean}@dawgaming.app`;
      }
    }

    try {
      const res = await signInWithEmailAndPassword(auth, emailToTry, pass);
      if (res.user) {
        await syncUserProfile(res.user);
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      let msg = 'Usuario o contraseña incorrectos';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Usuario o contraseña incorrectos';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'El usuario no existe. Contacta con Carlos J Samper para registrarte.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Demasiados intentos fallidos. Espera unos momentos.';
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    return signInWithUsername(email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName && res.user) {
        await updateProfile(res.user, { displayName });
      }
      if (res.user) {
        await syncUserProfile(res.user);
      }
    } catch (err: any) {
      console.error('Email Sign Up Error:', err);
      let msg = 'Error al registrar la cuenta';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Ya existe una cuenta con este nombre o correo';
      } else if (err.code === 'auth/weak-password') {
        msg = 'La contraseña debe tener al menos 6 caracteres';
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
      setError(err.message || 'Error al cerrar sesión');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithUsername,
        signInWithEmail,
        signUpWithEmail,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
