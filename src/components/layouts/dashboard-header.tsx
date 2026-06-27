"use client";

import * as React from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden rounded-md p-2 text-dark hover:bg-primary/5"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search shipments, drivers..."
              className="h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative rounded-md p-2 text-dark hover:bg-primary/5 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
            U
          </div>
        </div>
      </div>
    </header>
  );
}

DashboardHeader.displayName = "DashboardHeader";

export { DashboardHeader };
