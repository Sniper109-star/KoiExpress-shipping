import Link from "next/link";
import Image from "next/image";
import { getAdminUser } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#24151a]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#d9c9a2] bg-[#67040b] p-5 text-[#fff7df] md:block">
        <Link href="/admin/dashboard" className="flex items-center gap-3"><Image src="/brand/koi-express-logo.jpg" alt="KoiExpress logo" width={44} height={44} className="size-11 rounded-full border border-[#dcb45a] object-cover" /><span className="font-serif text-xl font-bold">KoiExpress</span></Link>
        <nav className="mt-10 flex flex-col gap-2 text-sm"><Link className="rounded-lg px-3 py-3 hover:bg-[#8a1018]" href="/admin/dashboard">Overview</Link><Link className="rounded-lg px-3 py-3 hover:bg-[#8a1018]" href="/admin/orders">Orders & shipments</Link><Link className="rounded-lg px-3 py-3 hover:bg-[#8a1018]" href="/admin/customers">Customers</Link></nav>
        <p className="absolute bottom-6 left-5 right-5 border-t border-[#dcb45a]/30 pt-4 font-mono text-[10px] uppercase tracking-widest text-[#dcb45a]">{user?.email ?? "Administrator access"}</p>
      </aside>
      <div className="md:pl-64"><header className="flex items-center justify-between border-b border-[#d9c9a2] bg-[#fffdf7] px-5 py-4 md:px-8"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a1018]">Control room</p><p className="font-serif text-xl font-bold">Shipping operations</p></div><form action="/auth/signout" method="post"><button className="rounded-lg border border-[#d9c9a2] px-3 py-2 text-sm hover:bg-[#f1ead9]">Sign out</button></form></header><main className="p-5 md:p-8">{children}</main></div>
    </div>
  );
}
