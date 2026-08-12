import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase.js'

const AuthContext = createContext(null)

const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.'
}

function mapAuthError(err) {
  return AUTH_ERROR_MESSAGES[err?.code] || 'Something went wrong. Please try again.'
}

// Creates the users/{uid} Firestore document the first time we see a user,
// so profile data (and later, per-user app data) has somewhere durable to
// live beyond what the Firebase Auth user object itself stores.
async function ensureUserProfileDoc(user, extra = {}) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName || extra.name || '',
      email: user.email,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp()
    })
  }
  return ref
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Explicit local persistence: sessions survive tab/browser restarts.
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) =>
      console.error('Failed to set auth persistence', err)
    )
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  // Keep the Firestore profile document in sync in real time so edits made
  // from Profile/Settings (or another tab) show up everywhere immediately.
  useEffect(() => {
    if (!currentUser) {
      setUserProfile(null)
      return
    }
    const ref = doc(db, 'users', currentUser.uid)
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) setUserProfile(snap.data())
    })
    return unsubscribe
  }, [currentUser])

  const clearError = useCallback(() => setAuthError(null), [])

  const signup = useCallback(async (name, email, password) => {
    setAuthError(null)
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(credential.user, { displayName: name })
      await ensureUserProfileDoc(credential.user, { name })
      return credential.user
    } catch (err) {
      const message = mapAuthError(err)
      setAuthError(message)
      throw new Error(message)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setAuthError(null)
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      return credential.user
    } catch (err) {
      const message = mapAuthError(err)
      setAuthError(message)
      throw new Error(message)
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setAuthError(null)
    try {
      const credential = await signInWithPopup(auth, googleProvider)
      await ensureUserProfileDoc(credential.user)
      return credential.user
    } catch (err) {
      const message = mapAuthError(err)
      setAuthError(message)
      throw new Error(message)
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const resetPassword = useCallback(async (email) => {
    setAuthError(null)
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      const message = mapAuthError(err)
      setAuthError(message)
      throw new Error(message)
    }
  }, [])

  // Updates both the Firebase Auth profile (name/photo) and the mirrored
  // Firestore document, then refreshes local state so the UI reflects it
  // without waiting for a full page reload.
  const updateUserProfile = useCallback(async ({ name, photoURL } = {}) => {
    if (!auth.currentUser) return
    await updateProfile(auth.currentUser, {
      ...(name !== undefined ? { displayName: name } : {}),
      ...(photoURL !== undefined ? { photoURL } : {})
    })
    const ref = doc(db, 'users', auth.currentUser.uid)
    await updateDoc(ref, {
      ...(name !== undefined ? { name } : {}),
      ...(photoURL !== undefined ? { photoURL } : {})
    })
    setCurrentUser({ ...auth.currentUser })
  }, [])

  const value = {
    currentUser,
    userProfile,
    authLoading,
    authError,
    clearError,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
