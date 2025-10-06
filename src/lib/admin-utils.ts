"use server";

import { NextRequest } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.project_id,
  clientEmail: process.env.client_email,
  privateKey: process.env.private_key?.replace(/\\n/g, '\n'),
};

export function initAdminIfNeeded() {
  if (!getApps().length) {
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      try {
        initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (e) {
        console.error('Firebase Admin initialization error', e);
      }
    } else {
      console.error('Firebase Admin SDK service account credentials not set.');
    }
  }
}

export async function requireAdmin(request: NextRequest) {
  initAdminIfNeeded();
  if (!getApps().length) {
    throw new Error('Firebase Admin not configured');
  }

  const adminAuth = getAuth();
  const adminFirestore = getFirestore();

  // Read session cookie from incoming request headers
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/__session=([^;]+)/);
  const sessionCookie = match ? decodeURIComponent(match[1]) : null;

  if (!sessionCookie) {
    throw new Error('No session cookie');
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    const profileDoc = await adminFirestore.collection('profiles').doc(uid).get();
    if (!profileDoc.exists) {
      throw new Error('Profile not found');
    }
    const profile = profileDoc.data();
    if (!profile || profile.primary_role !== 'admin') {
      throw new Error('Not an admin');
    }

    return { uid, profile };
  } catch (error) {
    console.error('Admin auth error:', error);
    throw new Error('Unauthorized');
  }
}

export function getAdminFirestore() {
  initAdminIfNeeded();
  return getFirestore();
}

export function getAdminAuth() {
  initAdminIfNeeded();
  return getAuth();
}
