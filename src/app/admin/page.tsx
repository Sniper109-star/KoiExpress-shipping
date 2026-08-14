"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!response.ok) {
      setError("Invalid email or password."); setPending(false); return;
    }
    router.push("/admin/dashboard"); router.refresh();
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
        <div className="mb-8 flex items-center gap-4">
          <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000774c81f4b27cbfff2a71b99c-6Zm6eM3G30MndkZwiO1EckpKT3tAk6.png" alt="UNIFET logistics platform logo" width={88} height={88} className="size-20 object-contain" />
          <div><p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Unifet Logistics</p><h1 className="font-serif text-3xl font-bold">Operations portal</h1></div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Restricted access</p><h2 className="mt-2 text-2xl font-semibold">Sign in to administer shipments</h2></div>
          <label className="flex flex-col gap-2 text-sm font-medium">Work email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="rounded-lg border border-input bg-background px-3 py-3 text-foreground outline-none focus:border-primary" /></label>
          <label className="flex flex-col gap-2 text-sm font-medium">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="rounded-lg border border-input bg-background px-3 py-3 text-foreground outline-none focus:border-primary" /></label>
          {error ? <p role="alert" className="text-sm text-[#ffb4a9]">{error}</p> : null}
          <button disabled={pending} className="rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">{pending ? "Checking access…" : "Enter dashboard"}</button>
        </form>
      </div>
    </main>
  );
}
