
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// This is a server-side only file. NEVER import it on the client.
const serviceAccount = {
  projectId: process.env.project_id,
  clientEmail: process.env.client_email,
  privateKey: process.env.private_key?.replace(/\\n/g, '\n'),
};

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
    console.error("Firebase service account key is not set. This API route will not work during development.");
  }
}

export async function GET() {
  if (!getApps().length) {
    return NextResponse.json({ isAuthenticated: false, onboardingComplete: false }, { status: 500 });
  }

  const adminAuth = getAuth();
  const adminFirestore = getFirestore();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ isAuthenticated: false, onboardingComplete: false });
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    const profileDoc = await adminFirestore.collection('profiles').doc(userId).get();

    // Profile should be created on session creation. If it doesn't exist, something is wrong,
    // but we'll treat them as not onboarded for safety.
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
