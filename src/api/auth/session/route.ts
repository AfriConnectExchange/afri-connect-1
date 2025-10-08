
import { NextResponse, type NextRequest } from 'next/server';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase-admin/firestore';
import { z } from 'zod';
import { logSystemEvent } from '@/lib/system-logger';

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
    console.error("Firebase service account key is not set. This API route will not work.");
  }
}

// Function to send an SMS via the Twilio extension
async function sendSms(to: string, body: string) {
  if (!getApps().length) {
    console.error("Firestore not initialized for SMS service.");
    return;
  }
  const firestore = getFirestore();
  await addDoc(collection(firestore, 'messages'), { to, body });
}

// Function to send an Email via the Email extension
async function sendEmail(to: string, subject: string, html: string) {
  if (!getApps().length) {
    console.error("Firestore not initialized for Email service.");
    return;
  }
  const firestore = getFirestore();
  await addDoc(collection(firestore, 'mail'), {
    to: [to],
    message: { subject, html },
  });
}

const sessionRequestSchema = z.object({
  idToken: z.string(),
});

async function createProfileIfNotExists(userId: string) {
  const adminFirestore = getFirestore();
  const profileRef = doc(adminFirestore, 'profiles', userId);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    const userRecord = await getAuth().getUser(userId);
    const profileData = {
      id: userId,
      auth_user_id: userId,
      email: userRecord.email,
      full_name: userRecord.displayName || '',
      phone_number: userRecord.phoneNumber || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      onboarding_completed: false,
      primary_role: 'buyer',
    };
    await setDoc(profileRef, profileData);
    
    // Log user creation event
    await logSystemEvent({ uid: userId }, {
      type: 'user_creation',
      status: 'success',
      description: `New user profile created for ${userRecord.email || userId}.`,
    });
    
    // Send Welcome Notifications
    if (userRecord.email) {
      await sendEmail(
        userRecord.email,
        'Welcome to AfriConnect Exchange!',
        `<h1>Welcome, ${userRecord.displayName || 'Friend'}!</h1><p>Thank you for joining AfriConnect Exchange. We're excited to have you on board.</p>`
      );
    }
    if (userRecord.phoneNumber) {
        await sendSms(userRecord.phoneNumber, `Welcome to AfriConnect Exchange! Your account is ready. Explore the marketplace today.`);
    }

    return true; // Indicates a new profile was created
  }
  return false; // Indicates profile already existed
}

export async function POST(request: NextRequest) {
  if (!getApps().length) {
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }

  const body = await request.json();
  const validation = sessionRequestSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request', details: validation.error.flatten() }, { status: 400 });
  }

  const { idToken } = validation.data;

  // Set session expiration to 14 days.
  const expiresIn = 60 * 60 * 24 * 14 * 1000;

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const isNewUser = await createProfileIfNotExists(decodedToken.uid);

    // Log the login event with device info
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'Unknown';
    await logSystemEvent({ uid: decodedToken.uid }, {
      type: 'user_login',
      status: 'success',
      description: `User ${decodedToken.email || decodedToken.uid} logged in.`,
      metadata: {
        isNewUser,
        ipAddress: ip,
        userAgent: userAgent,
        signInProvider: decodedToken.firebase.sign_in_provider,
      },
    });

    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });
    
    const response = NextResponse.json({ status: 'success', isNewUser });
    response.cookies.set('__session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return response;

  } catch (error: any) {
    console.error('Error creating session cookie:', error);
    await logSystemEvent({ uid: 'SYSTEM' }, {
      type: 'system_error',
      status: 'failure',
      description: 'Failed to create session cookie.',
      metadata: { error: error.message },
    });
    return NextResponse.json({ error: 'Failed to create session.', details: error.message }, { status: 401 });
  }
}
