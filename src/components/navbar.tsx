"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Fish } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Fish className="h-6 w-6 text-primary" />
          <span>KoiExpress</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link href="/track">
            <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/5">Track</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/5">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
          </Link>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground hover:text-primary hover:bg-primary/5"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link href="/track" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-center text-base h-12 text-foreground hover:text-primary hover:bg-primary/5">
                Track Package
              </Button>
            </Link>
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-center text-base h-12 text-foreground hover:text-primary hover:bg-primary/5">
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full justify-center text-base h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
