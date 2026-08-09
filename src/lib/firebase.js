import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// All values come from environment variables so real credentials never live
// in source control. Copy .env.example to .env.local and fill it in with
// your Firebase project's config (Project settings -> General -> Your apps).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

if (!firebaseConfig.apiKey && import.meta.env.DEV) {
  // Loud but non-fatal: lets the rest of the app boot so the UI is still
  // inspectable even before Firebase credentials are wired up.
  console.warn(
    '[Nexus] Firebase config is missing. Copy .env.example to .env.local ' +
      'and add your project credentials, or auth features will not work.'
  )
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
