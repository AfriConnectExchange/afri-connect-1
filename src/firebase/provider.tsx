'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { initializeFirebase } from '.';

interface FirebaseContextState {
  user: User | null;
  isUserLoading: boolean;
  auth: Auth;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { auth } = initializeFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const value = { user, isUserLoading, auth };

  return (
    <FirebaseContext.Provider value={value}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};
