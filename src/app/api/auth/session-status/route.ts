
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// This is a server-side only file. NEVER import it on the client.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!getApps().length) {
  if (!serviceAccount) {
    console.error("Firebase service account key is not set. This API route will not work.");
  } else {
    initializeApp({
      credential: {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      },
    });
  }
}

const adminAuth = getAuth();
const adminFirestore = getFirestore();

export async function GET() {
  if (!serviceAccount) {
    return NextResponse.json({ isAuthenticated: false, onboardingComplete: false }, { status: 500 });
  }
  
  const sessionCookie = cookies().get('__session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ isAuthenticated: false, onboardingComplete: false });
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    const profileDoc = await adminFirestore.collection('profiles').doc(userId).get();

    if (!profileDoc.exists) {
      return NextResponse.json({ isAuthenticated: true, onboardingComplete: false });
    }

    const profileData = profileDoc.data();
    const onboardingComplete = profileData?.onboarding_completed === true;

    return NextResponse.json({ isAuthenticated: true, onboardingComplete });

  } catch (error) {
    // Session cookie is invalid or expired.
    return NextResponse.json({ isAuthenticated: false, onboardingComplete: false });
  }
}
