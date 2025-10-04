'use client';

import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

type Props = {
  children: React.ReactNode;
};

const { firebaseApp, firestore, auth } = initializeFirebase();

export const FirebaseClientProvider = ({ children }: Props) => {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
    >
      {children}
    </FirebaseProvider>
  );
};
