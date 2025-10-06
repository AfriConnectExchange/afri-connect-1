"use server";

import { NextRequest } from 'next/server';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

const serviceAccount = {
  projectId: process.env.project_id,
  clientEmail: process.env.client_email,
  privateKey: process.env.private_key?.replace(/\\n/g, '\n'),
};

let adminApp: App | null = null;

export async function initAdminIfNeeded() {
  if (!getApps().length) {
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      try {
        adminApp = initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (e) {
        console.error('Firebase Admin initialization error', e);
      }
    } else {
      console.error('Firebase Admin SDK service account credentials not set.');
    }
  } else {
    adminApp = getApps()[0];
  }
}

export async function requireAdmin(request: NextRequest) {
  await initAdminIfNeeded();
  if (!adminApp) {
    throw new Error('Firebase Admin not configured');
  }

  const adminAuth = getAuth(adminApp);
  const adminFirestore = getFirestore(adminApp);

  const sessionCookie = (await cookies()).get('__session')?.value;
  
  if (!sessionCookie) {
    throw new Error('No session cookie provided');
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
      throw new Error('User is not an admin');
    }

    return { uid, profile, user: decoded };
  } catch (error) {
    console.error('Admin auth error:', error);
    throw new Error('Unauthorized');
  }
}

export async function getAdminFirestore() {
  await initAdminIfNeeded();
  return getFirestore(adminApp as App);
}

export async function getAdminAuth() {
  await initAdminIfNeeded();
  return getAuth(adminApp as App);
}
