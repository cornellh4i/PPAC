import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const apiKey =
  typeof firebaseConfig.apiKey === 'string'
    ? firebaseConfig.apiKey.trim()
    : '';

/** Firebase Auth instance, or null if env is missing/invalid or init fails. */
export let auth: Auth | null = null;
export let firebaseApp: FirebaseApp | null = null;

if (apiKey && apiKey !== 'undefined') {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
  } catch (error) {
    console.warn(
      'Firebase could not be initialized. Auth features are disabled.',
      error
    );
    firebaseApp = null;
    auth = null;
  }
} else {
  console.warn(
    'Firebase env vars are not set. Add REACT_APP_FIREBASE_* to frontend/.env.local. Auth is disabled until then.'
  );
}
