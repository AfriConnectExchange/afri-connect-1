import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

let app: App;

export function initFirebaseAdmin() {
  if (getApps().length === 0) {
    app = initializeApp({
      credential: credential.applicationDefault(),
    });
  } else {
    app = getApps()[0];
  }
  return app;
}
