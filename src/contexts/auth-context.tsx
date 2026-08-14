import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type User = { id: string; email: string; name?: string }
type Session = { user: User } | null

type AuthContextType = {
  user: User | null
  session: Session
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function authRequest(path: string, body?: Record<string, string>) {
  const response = await fetch(`/api/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload?.message ?? 'Authentication request failed')
  return payload
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/get-session').then((response) => response.ok ? response.json() : null).then((payload) => {
      const nextUser = payload?.user ?? payload?.session?.user ?? null
      setUser(nextUser)
      setSession(nextUser ? { user: nextUser } : null)
    }).finally(() => setLoading(false))
  }, [])

  const signIn = async (email: string, password: string) => {
    const payload = await authRequest('sign-in/email', { email, password })
    const nextUser = payload?.user ?? payload?.session?.user
    setUser(nextUser)
    setSession(nextUser ? { user: nextUser } : null)
  }
  const signUp = async (email: string, password: string, fullName: string) => {
    const payload = await authRequest('sign-up/email', { email, password, name: fullName })
    const nextUser = payload?.user ?? payload?.session?.user
    setUser(nextUser)
    setSession(nextUser ? { user: nextUser } : null)
  }
  const signOut = async () => { await authRequest('sign-out'); setUser(null); setSession(null) }
  const resetPassword = async (email: string) => { await authRequest('request-password-reset', { email, redirectTo: `${window.location.origin}/reset-password` }) }

  return <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
