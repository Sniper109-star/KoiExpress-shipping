"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layouts/sidebar";
import { DashboardHeader } from "@/components/layouts/dashboard-header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-accent">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 md:z-40 md:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 transition-transform duration-300"
        )}
      >
        <Sidebar className="shadow-xl md:shadow-none" />
      </div>

      {/* Main content area */}
      <div className="md:pl-64">
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

DashboardLayout.displayName = "DashboardLayout";

export { DashboardLayout };
