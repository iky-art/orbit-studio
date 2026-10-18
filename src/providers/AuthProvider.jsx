import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { authService, onAuthChange } from '../services/auth'

const AuthContext = createContext(null)

const ADMIN_ROLES = ['owner', 'admin']
const MIN_SPLASH_MS = 1250

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession())
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), MIN_SPLASH_MS)
    const unsubscribe = onAuthChange(setSession)
    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const next = await authService.signIn(email, password)
    setSession(next)
    return next
  }, [])

  const signUp = useCallback(async (payload) => {
    const next = await authService.signUp(payload)
    setSession(next)
    return next
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setSession(null)
  }, [])

  const updateProfile = useCallback(async (patch) => {
    const next = await authService.updateProfile(patch)
    setSession(next)
    return next
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session,
      booting,
      isAdmin: Boolean(session && ADMIN_ROLES.includes(session.role)),
      isAuthenticated: Boolean(session),
      onboarded: Boolean(session?.onboarded),
      signIn,
      signUp,
      signOut,
      updateProfile,
      resetPassword: authService.resetPassword,
    }),
    [session, booting, signIn, signUp, signOut, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return context
}

export { ADMIN_ROLES }
