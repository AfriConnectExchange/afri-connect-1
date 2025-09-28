'use server';
/**
 * @fileOverview A flow to retrieve the current user's profile from the database.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { Pool } from 'pg';
import { initFirebaseAdmin } from '@/firebase/server-init';

let db: Pool;

const initDb = () => {
  if (db) return;

  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
  };
  db = new Pool(config);
};

initDb();

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  full_name: z.string().nullable(),
  phone_number: z.string().nullable(),
  location: z.string().nullable(),
  role_id: z.number().int().nullable(),
  onboarding_completed: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export async function getUserProfile(): Promise<UserProfile | null> {
  return getUserProfileFlow();
}

const getUserProfileFlow = ai.defineFlow(
  {
    name: 'getUserProfileFlow',
    inputSchema: z.void(),
    outputSchema: UserProfileSchema.nullable(),
  },
  async () => {
    initFirebaseAdmin();
    const authToken = ai.getAuth()?.token;

    if (!authToken) {
      throw new Error('User is not authenticated.');
    }

    const decodedToken = await getAuth().verifyIdToken(authToken);
    const userId = decodedToken.uid;

    const query = {
      text: 'SELECT * FROM profiles WHERE id = $1',
      values: [userId],
    };
    
    try {
      const result = await db.query(query);
      if (result.rows.length === 0) {
        return null;
      }
      
      const profileData = result.rows[0];
      
      // Manually format dates to ISO strings
      profileData.created_at = new Date(profileData.created_at).toISOString();
      profileData.updated_at = new Date(profileData.updated_at).toISOString();

      return UserProfileSchema.parse(profileData);
    } catch (error: any) {
      console.error('Error fetching user profile from database:', error);
      throw new Error('Failed to retrieve user profile.');
    }
  }
);
