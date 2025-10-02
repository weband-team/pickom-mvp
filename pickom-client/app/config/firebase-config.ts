import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: process.env.NEXT_PUBLIC_VITE_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_VITE_FIREBASE_AUTH_DOMAIN,
});

export const auth = getAuth(firebaseApp);
