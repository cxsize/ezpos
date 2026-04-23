import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// @ts-expect-error — getReactNativePersistence is a runtime-only export in firebase/auth on RN
import { initializeAuth, getAuth, getReactNativePersistence, signInAnonymously, type Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

export function firebaseApp() {
  if (_app) return _app;
  if (!config.apiKey || !config.projectId) {
    throw new Error('Missing Firebase config. Copy .env.example to .env and fill it in.');
  }
  _app = getApps().length ? getApp() : initializeApp(config as Required<typeof config>);
  return _app;
}

export function db() {
  return (_db ??= getFirestore(firebaseApp()));
}

export function auth() {
  if (_auth) return _auth;
  try {
    _auth = initializeAuth(firebaseApp(), {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Already initialized (e.g. Fast Refresh) — fall through.
    _auth = getAuth(firebaseApp());
  }
  return _auth!;
}

/** Sign the device in anonymously so Firestore rules can require auth. */
export async function ensureSignedIn() {
  const a = auth();
  if (a.currentUser) return a.currentUser;
  const cred = await signInAnonymously(a);
  return cred.user;
}
