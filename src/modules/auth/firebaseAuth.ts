import { getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type UserCredential } from 'firebase/auth'

export const getConfiguredAuth = () => {
  const env = import.meta.env
  if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_AUTH_DOMAIN || !env.VITE_FIREBASE_PROJECT_ID || !env.VITE_FIREBASE_APP_ID) return null
  const app = getApps()[0] ?? initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  })
  return getAuth(app)
}

export const signInWithGoogle = async (scope?: string): Promise<UserCredential> => {
  const auth = getConfiguredAuth()
  if (!auth) throw new Error('Add Firebase credentials in .env to enable Google sign-in.')
  const provider = new GoogleAuthProvider()
  if (scope) provider.addScope(scope)
  return signInWithPopup(auth, provider)
}

export const signOutOfGoogle = async () => {
  const auth = getConfiguredAuth()
  if (!auth) throw new Error('Firebase Authentication is not configured.')
  return signOut(auth)
}
