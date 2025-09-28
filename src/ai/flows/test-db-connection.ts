'use server';
/**
 * @fileOverview A flow to test the database connection.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Pool } from 'pg';

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

export async function testDbConnection(): Promise<any> {
  return testDbConnectionFlow();
}

const testDbConnectionFlow = ai.defineFlow(
  {
    name: 'testDbConnectionFlow',
    inputSchema: z.void(),
    outputSchema: z.any(),
  },
  async () => {
    try {
      const result = await db.query('SELECT NOW()');
      return { success: true, dbTime: result.rows[0].now };
    } catch (error: any) {
      console.error('Database connection test failed:', error);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }
);
