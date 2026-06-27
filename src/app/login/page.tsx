import Link from "next/link";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Sign in</h1>
        <p className="text-muted-foreground mb-4">
          Authentication is handled by Supabase Auth.
        </p>
        <Link href="/register" className="text-sm underline">
          Create account
        </Link>
      </div>
    </div>
  );
}