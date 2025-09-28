'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import React, { useState, useEffect, useContext, createContext } from 'react';

interface FirebaseContextValue {
    user: User | null;
    isUserLoading: boolean;
    auth: Auth;
    firestore: Firestore;
    firebaseApp: FirebaseApp;
}

export const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

export function initializeFirebase() {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export const FirebaseClientProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { auth, firestore, firebaseApp } = initializeFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setIsUserLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const value = { user, isUserLoading, auth, firestore, firebaseApp };

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
};


export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
