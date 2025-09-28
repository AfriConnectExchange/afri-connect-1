import { createClient } from '@supabase/supabase-js';
import { getAuth } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

// Initialize Firebase to get the auth instance
const { auth } = initializeFirebase();

// Create a single Supabase client instance
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      // Get the Firebase Auth JWT
      headers: {
        Authorization: `Bearer ${(auth.currentUser
          ?.getIdToken()
          ?.then((token) => token)) ?? null}`,
      },
    },
  }
);
