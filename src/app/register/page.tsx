import Link from "next/link";
import { ArrowLeft, Fish } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <Fish className="h-5 w-5 text-primary" />
            <span>KoiExpress</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-dark">Create your account</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Join KoiExpress and start shipping with confidence.
            </p>
          </div>

          <div className="rounded-xl border border-red-100 bg-white p-6 md:p-8 space-y-4 shadow-sm">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-dark">
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
              <label htmlFor="password" className="text-sm font-medium text-dark">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
              />
            </div>
            <Button className="w-full h-12 rounded-md bg-primary text-white font-medium text-base hover:bg-primary/90">
              Create Account
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
