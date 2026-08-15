import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

type User = { id: string; email?: string; user_metadata?: Record<string, unknown>; name?: string }
type Session = { user: User } | null

const supabase = createClient()

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setUser(data.user as User | null)
      setSession(data.user ? { user: data.user as User } : null)
      setLoading(false)
    }).catch(() => { if (active) setLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setUser(nextSession?.user as User | null)
      setSession(nextSession?.user ? { user: nextSession.user as User } : null)
      setLoading(false)
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message.includes('Invalid login') ? 'Invalid email or password' : error.message)
    setUser(data.user as User); setSession(data.user ? { user: data.user as User } : null)
  }
  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback` } })
    if (error) throw new Error(error.message)
    setUser(data.user as User | null); setSession(data.user ? { user: data.user as User } : null)
  }
  const signOut = async () => { const { error } = await supabase.auth.signOut(); if (error) throw error; setUser(null); setSession(null) }
  const resetPassword = async (email: string) => { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback` }); if (error) throw error }

  return <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
