import { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '../lib/firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    // Handle magic link redirect
    if (isSignInWithEmailLink(auth, globalThis.location.href)) {
      let email = globalThis.localStorage.getItem('emailForSignIn')
      if (!email) {
        email = globalThis.prompt('Please provide your email for confirmation')
      }
      if (email) {
        signInWithEmailLink(auth, email, globalThis.location.href)
          .then(() => {
            globalThis.localStorage.removeItem('emailForSignIn')
          })
          .catch((error) => {
            console.error('Error signing in with email link', error)
          })
      }
    }

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const signInWithMagicLink = async (email) => {
    try {
      const actionCodeSettings = {
        url: globalThis.location.origin,
        handleCodeInApp: true,
      }
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      globalThis.localStorage.setItem('emailForSignIn', email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => firebaseSignOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
