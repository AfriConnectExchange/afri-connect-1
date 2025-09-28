
import { onUserCreate } from 'firebase-functions/v2/auth';
import { logger } from 'firebase-functions';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize connection pool
let db: Pool;

const initDb = () => {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`, // Use this for Cloud Functions
    };
    
    // For local development, you might connect differently, e.g., via TCP
    if (!process.env.INSTANCE_CONNECTION_NAME) {
        config.host = 'localhost';
    }

    db = new Pool(config);
};

initDb();

export const createProfile = onUserCreate(async (event) => {
  const user = event.data;
  const { uid, email } = user;

  logger.info(`New user created: ${uid}, email: ${email}`);

  const query = {
    text: 'INSERT INTO profiles(id, email) VALUES($1, $2) ON CONFLICT (id) DO NOTHING',
    values: [uid, email],
  };

  try {
    await db.query(query);
    logger.info(`Successfully created profile for user: ${uid}`);
  } catch (error) {
    logger.error(`Error creating profile for user: ${uid}`, error);
    // Depending on your error handling strategy, you might want to re-throw,
    // or handle it gracefully.
  }
});
