import Link from "next/link";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Create account</h1>
        <p className="text-muted-foreground mb-4">
          Registration is handled by Supabase Auth.
        </p>
        <Link href="/login" className="text-sm underline">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}