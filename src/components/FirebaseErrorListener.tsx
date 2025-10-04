'use client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("Firestore Permission Error:", error.message, error.context);
      
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "You do not have permission to perform this action. Check your security rules.",
        duration: 10000,
      });

      // In a development environment, we can throw the error to show the Next.js error overlay
      if (process.env.NODE_ENV === 'development') {
        // We throw it in a timeout to escape the React render cycle
        setTimeout(() => {
            throw error;
        }, 0);
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything
}
