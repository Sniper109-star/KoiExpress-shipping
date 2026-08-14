import Link from "next/link"
import Image from "next/image"
import { BarChart3, Bell, Boxes, ClipboardList, FileText, LayoutDashboard, MapPinned, Package, Settings, ShieldCheck, Truck, Users, Warehouse } from "lucide-react"
import { getAdminUser } from "@/lib/admin-auth"

export const metadata = { title: "UNIFET Admin Control Room", robots: { index: false, follow: false } }

const navigation = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Shipments", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/deliveries", label: "Deliveries", icon: Truck },
  { href: "/admin/facilities", label: "Facilities", icon: Warehouse },
  { href: "/admin/tracking", label: "Tracking", icon: MapPinned },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/activity", label: "Activity logs", icon: ClipboardList },
  { href: "/admin/staff", label: "Staff & roles", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser()
  return (
    <div className="min-h-screen bg-[#071321] text-[#edf4f8]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-[#1d3548] bg-[#0a1a2b] md:block">
        <div className="flex h-full flex-col px-5 py-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3 border-b border-[#1d3548] pb-6">
            <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000774c81f4b27cbfff2a71b99c-6Zm6eM3G30MndkZwiO1EckpKT3tAk6.png" alt="UNIFET logistics logo" width={48} height={48} className="size-12 rounded-xl object-contain" />
            <span><span className="block font-mono text-[10px] uppercase tracking-[0.24em] text-[#df3038]">UNIFET</span><span className="font-semibold tracking-tight">Operations</span></span>
          </Link>
          <nav aria-label="Admin navigation" className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#9fb4c3] transition hover:bg-[#112b40] hover:text-[#edf4f8]"><Icon className="size-4" aria-hidden="true" />{label}</Link>)}
          </nav>
          <div className="border-t border-[#1d3548] pt-4"><p className="truncate text-xs text-[#9fb4c3]">{user?.email ?? "Administrator"}</p><form action="/auth/signout" method="post"><button className="mt-3 text-xs font-semibold text-[#df3038] hover:text-[#ff6a6d]">Sign out</button></form></div>
        </div>
      </aside>
      <div className="md:pl-72"><header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#1d3548] bg-[#071321]/95 px-5 py-4 backdrop-blur md:px-8"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#df3038]">Control room / live operations</p><p className="mt-1 font-semibold">Shipment network overview</p></div><div className="flex items-center gap-3"><span className="hidden rounded-full border border-[#1d3548] px-3 py-1.5 text-xs text-[#9fb4c3] sm:inline">Neon connected</span><div className="size-2 rounded-full bg-[#36c275]" aria-label="System online" /></div></header><main className="p-5 md:p-8">{children}</main></div>
    </div>
  )
}
