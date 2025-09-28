'use client';
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(request: NextRequest) {
  const { auth } = initializeFirebase();
  const { email, password } = await request.json();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // The session is managed client-side by the Firebase SDK,
    // so we just need to confirm success.
    return NextResponse.json({ message: 'Login successful', user: userCredential.user });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}
