
import { NextResponse, type NextRequest } from 'next/server';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';

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

const sessionRequestSchema = z.object({
  idToken: z.string(),
});


export async function POST(request: NextRequest) {
  if (!getApps().length) {
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }

  const body = await request.json();
  const validation = sessionRequestSchema.safeParse(body);

  if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request', details: validation.error.flatten() }, { status: 400 });
  }
  
  const { idToken, clientInfo } = validation.data as { idToken: string; clientInfo?: any };

  // Set session expiration to 14 days.
  const expiresIn = 60 * 60 * 24 * 14 * 1000;

  try {
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    // Try to determine the user id from the idToken so we can check/create profile
    const adminAuth = getAuth();
    const adminFirestore = getFirestore();

    let isNewUser = false;
    let decodedToken: any = null;
    let uid: string | null = null;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
      uid = decodedToken.uid;

  const profileDoc = await adminFirestore.collection('profiles').doc(uid!).get();
      if (!profileDoc.exists) {
        // Create a minimal profile for new users and persist client info
  const userRecord = await adminAuth.getUser(uid!);
        const profileData: any = {
          id: uid,
          auth_user_id: uid,
          email: userRecord.email || '',
          full_name: userRecord.displayName || '',
          phone_number: userRecord.phoneNumber || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          onboarding_completed: false,
          primary_role: 'buyer',
          roles: ['buyer'],
          preferences: {
            language: 'en',
            timezone: 'UTC',
            notifications: { email: true, sms: false, push: true }
          },
          address: null,
          seller: {
            businessName: null,
            businessDescription: null,
            bankDetailsEncrypted: null,
            seller_reputation: 0,
          }
        };

        // include client-provided info (geolocation, UA) if present
        if (clientInfo) {
          profileData.client_info = clientInfo;
        }

        // capture IP / user-agent from the request headers
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
        const ua = request.headers.get('user-agent') || '';
        if (ip) profileData.ip_address = ip;
        if (ua) profileData.user_agent = ua;

  await adminFirestore.collection('profiles').doc(uid!).set(profileData);
        isNewUser = true;
        // Queue verification email + welcome message if email exists
        if (profileData.email) {
          try {
            const { generateAndQueueVerificationEmail, queueEmail } = await import('@/lib/email');
            await generateAndQueueVerificationEmail(profileData.email, uid!);
            await queueEmail({ to: profileData.email, subject: 'Welcome to AfriConnect', html: `<p>Welcome ${profileData.full_name || ''} — thanks for joining AfriConnect.</p>`, text: `Welcome to AfriConnect` });
          } catch (e) {
            console.error('Failed to queue welcome/verification emails', e);
          }
        }
      }
    } catch (error) {
      // ignore profile creation errors; session cookie will still be created
      console.error('Warning: could not check/create profile during session creation', error);
    }

    const response = NextResponse.json({ status: 'success', isNewUser });
    response.cookies.set('__session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    // For returning users, enqueue a login notification (respect user preferences)
    try {
      if (!isNewUser && uid) {
        const profileDocRef = adminFirestore.collection('profiles').doc(uid);
        const profileSnap = await profileDocRef.get();
        const profile = profileSnap.exists ? profileSnap.data() : null;
        const wantsEmail = profile?.preferences?.notifications?.email ?? true;
        const emailToUse = profile?.email || (await adminAuth.getUser(uid)).email;
        if (wantsEmail && emailToUse) {
          try {
            const { queueEmail } = await import('@/lib/email');
            const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
            const ua = request.headers.get('user-agent') || '';
            await queueEmail({
              to: emailToUse,
              subject: 'AfriConnect — New sign-in to your account',
              html: `<p>Hi ${profile?.full_name || ''},</p><p>We noticed a sign-in to your AfriConnect account.</p><p><strong>Time:</strong> ${new Date().toISOString()}</p><p><strong>IP:</strong> ${ip}</p><p><strong>Agent:</strong> ${ua}</p><p>If this wasn't you, please reset your password or contact support.</p>`,
              text: `Hi ${profile?.full_name || ''},\nWe noticed a sign-in to your AfriConnect account. Time: ${new Date().toISOString()} IP: ${ip}`,
            });
          } catch (e) {
            console.error('Failed to queue login notification', e);
          }
        }
      }
    } catch (e) {
      console.error('Error while enqueueing login notification', e);
    }

    return response;

  } catch (error: any) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ error: 'Failed to create session.', details: error.message }, { status: 401 });
  }
}
