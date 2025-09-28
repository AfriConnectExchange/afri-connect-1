'use server';
/**
 * @fileOverview A flow to test the database connection.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Pool } from 'pg';

let db: Pool;

// This function initializes the database connection pool.
const initDb = () => {
  if (db) return;

  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
  };

  // When running in a production Google Cloud environment, the `INSTANCE_CONNECTION_NAME`
  // will be set. In this case, we need to connect via a Unix socket.
  if (process.env.INSTANCE_CONNECTION_NAME) {
    config.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
  }

  db = new Pool(config);
};

// Initialize the database connection when the module is loaded.
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
      // Provide a more detailed error message to help diagnose the issue.
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }
);
