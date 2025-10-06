
import { NextResponse, type NextRequest } from 'next/server';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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
  
  const { idToken } = validation.data;

  // Set session expiration to 14 days.
  const expiresIn = 60 * 60 * 24 * 14 * 1000;

  try {
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });
    
    const response = NextResponse.json({ status: 'success' });
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
    return NextResponse.json({ error: 'Failed to create session.', details: error.message }, { status: 401 });
  }
}
