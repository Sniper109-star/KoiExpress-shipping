'use client'

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function Login() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      await signIn(email.trim(), password)
      router.push("/create-shipment")
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <Image src="/brand/unifet-vehicle-mark.png" alt="UNIFET logo" width={28} height={28} className="size-7 rounded-full object-cover" />
            <span>UNIFET</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm md:text-base">Sign in to your UNIFET account to manage USA and global shipments.</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-sm">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground" />
            </div>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={pending} className="w-full h-12 rounded-md bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90">
              {pending ? <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Signing in...</> : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">Don&apos;t have an account? <Link href="/register" className="font-medium text-primary underline">Create account</Link></p>
        </div>
      </main>
    </div>
  )
}
