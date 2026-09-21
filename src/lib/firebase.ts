import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Helper to extract config either from a single JSON string or individual environment variables
export const getFirebaseConfig = () => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_CONFIG) {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
    } catch (e) {
      console.warn('Failed to parse NEXT_PUBLIC_FIREBASE_CONFIG JSON:', e);
    }
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBfKaXcqIEumKig4hTInAQF_dATClVJpDs',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'chill24arena.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chill24arena',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'chill24arena.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '809200142795',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:809200142795:web:2fbef194ab939923148e4e',
  };
};

const firebaseConfig = getFirebaseConfig();

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    !firebaseConfig.apiKey.includes('Dummy')
  );
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;

export const initFirebase = (): {
  app: FirebaseApp | undefined;
  auth: Auth | undefined;
  db: Firestore | undefined;
  googleProvider: GoogleAuthProvider | undefined;
} => {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    if (app && !auth) {
      auth = getAuth(app);
      db = getFirestore(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
    }
  } catch (error) {
    console.warn('Firebase initialization notice:', error);
  }

  return { app, auth, db, googleProvider };
};

// Initialize on load
if (typeof window !== 'undefined' || isFirebaseConfigured()) {
  initFirebase();
}

export const getFirebaseAuth = (): Auth | undefined => {
  if (!auth) initFirebase();
  return auth;
};

export const getFirebaseDb = (): Firestore | undefined => {
  if (!db) initFirebase();
  return db;
};

export const getGoogleProvider = (): GoogleAuthProvider | undefined => {
  if (!googleProvider) initFirebase();
  return googleProvider;
};

export { app, auth, db, googleProvider };

