import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Create account</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Registration is handled by Supabase Auth.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 md:p-8 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
              />
            </div>
            <button className="w-full h-12 rounded-md bg-primary text-primary-foreground font-medium text-base">
              Create Account
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}