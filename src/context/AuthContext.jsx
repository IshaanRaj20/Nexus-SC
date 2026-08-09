import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'

import {
  auth,
  db,
  googleProvider,
} from '../lib/firebase.js'

const AuthContext = createContext(null)

const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use':
    'An account with this email already exists.',

  'auth/invalid-email':
    'Enter a valid email address.',

  'auth/weak-password':
    'Password should be at least 6 characters.',

  'auth/user-not-found':
    'No account found with this email.',

  'auth/wrong-password':
    'Incorrect email or password.',

  'auth/invalid-credential':
    'Incorrect email or password.',

  'auth/too-many-requests':
    'Too many attempts. Please wait and try again.',

  'auth/popup-closed-by-user':
    'Google sign-in was cancelled.',

  'auth/network-request-failed':
    'Network error. Check your connection and try again.',
}

function mapAuthError(err) {
  return (
    AUTH_ERROR_MESSAGES[err?.code] ||
    'Something went wrong. Please try again.'
  )
}

async function ensureUserProfileDoc(user, extra = {}) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name:
        user.displayName ||
        extra.name ||
        '',
      email: user.email,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
    })
  }

  return ref
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] =
    useState(null)

  const [userProfile, setUserProfile] =
    useState(null)

  const [userProfileLoading, setUserProfileLoading] =
    useState(true)

  const [authLoading, setAuthLoading] =
    useState(true)

  const [authError, setAuthError] =
    useState(null)

  // Keep authentication sessions persistent.
  useEffect(() => {
    setPersistence(
      auth,
      browserLocalPersistence
    ).catch((err) => {
      console.error(
        'Failed to set auth persistence',
        err
      )
    })
  }, [])

  // Watch Firebase Authentication.
  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(auth, (user) => {
        setCurrentUser(user)
        setAuthLoading(false)
      })

    return unsubscribe
  }, [])

  // Watch the user's Firestore profile in real time.
  useEffect(() => {
    if (!currentUser) {
      setUserProfile(null)
      setUserProfileLoading(false)
      return
    }

    setUserProfileLoading(true)

    const ref = doc(
      db,
      'users',
      currentUser.uid
    )

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setUserProfile(snap.data())
        } else {
          setUserProfile(null)
        }

        setUserProfileLoading(false)
      },
      (error) => {
        console.error(
          'Profile listener error:',
          error
        )

        setUserProfileLoading(false)
      }
    )

    return unsubscribe
  }, [currentUser])

  const clearError = useCallback(
    () => setAuthError(null),
    []
  )

  // Sign up.
  const signup = useCallback(
    async (name, email, password) => {
      setAuthError(null)

      try {
        const credential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          )

        await updateProfile(
          credential.user,
          {
            displayName: name,
          }
        )

        await ensureUserProfileDoc(
          credential.user,
          { name }
        )

        return credential.user
      } catch (err) {
        const message = mapAuthError(err)
        setAuthError(message)
        throw new Error(message)
      }
    },
    []
  )

  // Login.
  const login = useCallback(
    async (email, password) => {
      setAuthError(null)

      try {
        const credential =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          )

        return credential.user
      } catch (err) {
        const message = mapAuthError(err)
        setAuthError(message)
        throw new Error(message)
      }
    },
    []
  )

  // Google login.
  const loginWithGoogle = useCallback(
    async () => {
      setAuthError(null)

      try {
        const credential =
          await signInWithPopup(
            auth,
            googleProvider
          )

        await ensureUserProfileDoc(
          credential.user
        )

        return credential.user
      } catch (err) {
        const message = mapAuthError(err)
        setAuthError(message)
        throw new Error(message)
      }
    },
    []
  )

  // Logout.
  const logout = useCallback(
    async () => {
      await signOut(auth)
    },
    []
  )

  // Password reset.
  const resetPassword = useCallback(
    async (email) => {
      setAuthError(null)

      try {
        await sendPasswordResetEmail(
          auth,
          email
        )
      } catch (err) {
        const message = mapAuthError(err)
        setAuthError(message)
        throw new Error(message)
      }
    },
    []
  )

  // Update profile.
  const updateUserProfile = useCallback(
    async ({ name, photoURL } = {}) => {
      if (!auth.currentUser) {
        return
      }

      // Update Firebase Auth name only.
      if (name !== undefined) {
        await updateProfile(
          auth.currentUser,
          {
            displayName: name,
          }
        )
      }

      // Make sure the Firestore profile exists.
      const ref =
        await ensureUserProfileDoc(
          auth.currentUser
        )

      const firestoreUpdates = {}

      if (name !== undefined) {
        firestoreUpdates.name = name
      }

      if (photoURL !== undefined) {
        firestoreUpdates.photoURL = photoURL
      }

      if (
        Object.keys(firestoreUpdates).length > 0
      ) {
        await updateDoc(
          ref,
          firestoreUpdates
        )
      }

      // Refresh local Firebase Auth user.
      setCurrentUser({
        ...auth.currentUser,
      })
    },
    []
  )

  const value = {
    currentUser,
    userProfile,
    userProfileLoading,
    authLoading,
    authError,
    clearError,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    )
  }

  return ctx
}