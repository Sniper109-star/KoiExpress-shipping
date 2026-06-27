import Link from "next/link";
import { Fish } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  company: [
    { href: "#", label: "About" },
    { href: "#", label: "Careers" },
    { href: "#", label: "Press" },
  ],
  services: [
    { href: "#", label: "Same-Day Delivery" },
    { href: "#", label: "International" },
    { href: "#", label: "Freight" },
  ],
  support: [
    { href: "#", label: "Help Center" },
    { href: "#", label: "Contact" },
    { href: "#", label: "Status" },
  ],
  legal: [
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
    { href: "#", label: "Cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:gap-12 grid-cols-2 md:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Fish className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">KoiExpress</span>
            </Link>
            <p className="text-white/60 text-sm max-w-xs leading-relaxed">
              End-to-end delivery management with real-time tracking. Fast, reliable, and professional.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/80">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/80">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/80">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/80">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60">
            &copy; {new Date().getFullYear()} KoiExpress. All rights reserved.
          </p>
          <Button variant="secondary" size="sm">
            Get Started
          </Button>
        </div>
      </div>
    </footer>
  );
}

Footer.displayName = "Footer";
