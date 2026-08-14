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
    <main className="min-h-screen bg-[#67040b] px-6 py-12 text-[#fff7df]">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
        <div className="mb-8 flex items-center gap-4">
          <Image src="/brand/koi-express-logo.jpg" alt="KoiExpress logo" width={68} height={68} className="size-16 rounded-full border-2 border-[#dcb45a] object-cover" />
          <div><p className="font-mono text-xs uppercase tracking-[0.24em] text-[#dcb45a]">KoiExpress</p><h1 className="font-serif text-3xl font-bold">Operations portal</h1></div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-[#dcb45a]/30 bg-[#250e17] p-6 shadow-2xl">
          <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-[#dcb45a]">Restricted access</p><h2 className="mt-2 text-2xl font-semibold">Sign in to administer shipments</h2></div>
          <label className="flex flex-col gap-2 text-sm font-medium">Work email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="rounded-lg border border-[#dcb45a]/30 bg-[#160a10] px-3 py-3 text-[#fff7df] outline-none focus:border-[#dcb45a]" /></label>
          <label className="flex flex-col gap-2 text-sm font-medium">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="rounded-lg border border-[#dcb45a]/30 bg-[#160a10] px-3 py-3 text-[#fff7df] outline-none focus:border-[#dcb45a]" /></label>
          {error ? <p role="alert" className="text-sm text-[#ffb4a9]">{error}</p> : null}
          <button disabled={pending} className="rounded-lg bg-[#dcb45a] px-4 py-3 font-semibold text-[#250e17] transition hover:bg-[#f0d27f] disabled:cursor-wait disabled:opacity-60">{pending ? "Checking access…" : "Enter dashboard"}</button>
        </form>
      </div>
    </main>
  );
}
