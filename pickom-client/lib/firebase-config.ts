import { initializeApp } from 'firebase/app';
import { getAuth, indexedDBLocalPersistence, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set persistence for Capacitor WebView compatibility
if (typeof window !== 'undefined') {
  const isNative = Capacitor.isNativePlatform();
  // Use indexedDB for native apps, browserLocal for web
  const persistence = isNative ? indexedDBLocalPersistence : browserLocalPersistence;
  setPersistence(auth, persistence).catch(console.error);
}
