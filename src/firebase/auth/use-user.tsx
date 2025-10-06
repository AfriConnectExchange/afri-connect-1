'use client';

import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { useState, useEffect }from 'react';
import { useAuth } from '../provider';

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      return;
    }
    let didUnsubscribe = false;
    let timeoutHandle: number | undefined;

    try {
      console.debug('[useUser] attaching onAuthStateChanged listener');
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        if (didUnsubscribe) return;
        console.debug('[useUser] onAuthStateChanged fired', { uid: u?.uid ?? null });
        setUser(u);
        setIsLoading(false);
        if (timeoutHandle) window.clearTimeout(timeoutHandle);
      }, (error) => {
        console.error('[useUser] onAuthStateChanged error', error);
        // ensure we don't stay in loading forever on error
        setUser(null);
        setIsLoading(false);
        if (timeoutHandle) window.clearTimeout(timeoutHandle);
      });

      // Safety timeout: if onAuthStateChanged does not call back in X ms,
      // assume something went wrong and stop showing the global loading state.
      timeoutHandle = window.setTimeout(() => {
        console.warn('[useUser] auth state not resolved within timeout, clearing loading state');
        setIsLoading(false);
      }, 10000); // 10s

      return () => {
        didUnsubscribe = true;
        try {
          unsubscribe();
        } catch (e) {
          // ignore
        }
        if (timeoutHandle) window.clearTimeout(timeoutHandle);
      };
    } catch (err) {
      console.error('[useUser] failed to attach onAuthStateChanged', err);
      setUser(null);
      setIsLoading(false);
    }
  }, [auth]);

  return { user, isLoading };
};
