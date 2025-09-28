import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  const { auth, firestore } = initializeFirebase();
  const { email, password, name } = await request.json();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's profile with their name
    await updateProfile(user, { displayName: name });
    
    // Create a corresponding profile document in Firestore
    await setDoc(doc(firestore, "profiles", user.uid), {
        id: user.uid,
        full_name: name,
        email: user.email,
        role_id: 1, // Default role to 'buyer'
        onboarding_completed: false, 
    });


    return NextResponse.json({
      message: 'User registered successfully.',
      user: user,
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
