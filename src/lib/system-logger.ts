
'use server';

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth, User } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!getApps().length && serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount as any),
    });
}

type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  type: string; // e.g., 'escrow_creation', 'user_login', 'product_view'
  status?: 'success' | 'failure' | 'pending';
  amount?: number;
  description: string;
  order_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Logs a critical system event to the database.
 * This is used for creating an audit trail of all important actions.
 * @param user - The user performing the action.
 * @param payload - The data to be logged.
 */
export async function logSystemEvent(user: User, payload: LogPayload) {
  if (!getApps().length) {
    console.error("CRITICAL: Failed to log system event - Firebase Admin not initialized");
    return;
  }
  const adminFirestore = getFirestore();

  const { error } = await adminFirestore.collection('transactions').add({
    profile_id: user.uid,
    type: payload.type,
    status: payload.status || 'completed',
    amount: payload.amount || 0,
    description: payload.description,
    order_id: payload.order_id,
    provider: 'system', // Indicates this is an internal system log
    metadata: payload.metadata || {},
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error('CRITICAL: Failed to log system event:', error);
    // In a production environment, you might want to send an alert here
    // as failing to log is a security/audit concern.
  }
}
