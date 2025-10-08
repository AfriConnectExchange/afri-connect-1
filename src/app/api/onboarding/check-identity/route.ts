"use server";

import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// initialize admin (reuse env names used across the repo)
const PROJECT_ID = process.env.PROJECT_ID || process.env.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL || process.env.client_email || process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY_RAW = process.env.PRIVATE_KEY || process.env.private_key || process.env.FIREBASE_PRIVATE_KEY;
const PRIVATE_KEY = PRIVATE_KEY_RAW ? PRIVATE_KEY_RAW.replace(/\\n/g, '\n').replace(/^"|"$/g, '') : undefined;

const serviceAccount = {
  projectId: PROJECT_ID,
  clientEmail: CLIENT_EMAIL,
  privateKey: PRIVATE_KEY,
};

if (!getApps().length) {
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      initializeApp({ credential: cert(serviceAccount) });
    } catch (e) {
      console.error('Admin init failed for onboarding check', e);
    }
  } else {
    console.warn('Firebase Admin service account not configured for onboarding check');
  }
}

type CheckRequest = {
  email?: string;
  phone?: string;
};

export async function POST(request: Request) {
  if (!getApps().length) {
    return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
  }

  try {
    const adminAuth = getAuth();
    const adminFs = getFirestore();

    // Verify session cookie to get current user (if any)
    // we expect client to include same-origin cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/__session=([^;]+)/);
    let currentUid: string | null = null;
    if (sessionMatch) {
      const sessionCookie = decodeURIComponent(sessionMatch[1]);
      try {
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        currentUid = decoded.uid;
      } catch (e) {
        // not fatal; we'll still run checks as anonymous
        currentUid = null;
      }
    }

    const body: CheckRequest = await request.json();
    const { email, phone } = body || {};

    const result: any = { email: null, phone: null };

    if (email) {
      try {
        const userByEmail = await adminAuth.getUserByEmail(email);
        // if the found user is not the same as the current user, report conflict
        result.email = {
          exists: true,
          uid: userByEmail.uid,
          providerData: userByEmail.providerData || [],
          sameAsCurrent: currentUid === userByEmail.uid,
        };

        // also check Firestore profiles for duplicate display names / emails
        const profilesRef = adminFs.collection('profiles');
        const q = await profilesRef.where('email', '==', email).limit(1).get();
        if (!q.empty) {
          const doc = q.docs[0];
          result.email.profile = { id: doc.id, data: doc.data() };
        }
      } catch (err: any) {
        // not found -> no conflict
        result.email = { exists: false };
      }
    }

    if (phone) {
      try {
        const userByPhone = await adminAuth.getUserByPhoneNumber(phone);
        result.phone = {
          exists: true,
          uid: userByPhone.uid,
          providerData: userByPhone.providerData || [],
          sameAsCurrent: currentUid === userByPhone.uid,
        };

        const profilesRef = adminFs.collection('profiles');
        const q2 = await profilesRef.where('phone_number', '==', phone).limit(1).get();
        if (!q2.empty) {
          const doc = q2.docs[0];
          result.phone.profile = { id: doc.id, data: doc.data() };
        }
      } catch (err: any) {
        result.phone = { exists: false };
      }
    }

    return NextResponse.json({ ok: true, currentUid, result });
  } catch (error: any) {
    console.error('Onboarding identity check error', error);
    return NextResponse.json({ ok: false, error: error.message || String(error) }, { status: 500 });
  }
}
