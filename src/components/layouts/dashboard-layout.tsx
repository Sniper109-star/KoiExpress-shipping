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
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        :root {
          --primary: #E63946;
          --primary-foreground: #FFFFFF;
          --secondary: #1D3557;
          --secondary-foreground: #FFFFFF;
          --accent: #F1FAEE;
          --accent-foreground: #0B132B;
          --dark: #0B132B;
          --dark-foreground: #FFFFFF;
          --success: #06D6A0;
          --success-foreground: #FFFFFF;
          --background: #FFFFFF;
          --foreground: #0B132B;
          --card: #FFFFFF;
          --card-foreground: #0B132B;
          --muted: #F1FAEE;
          --muted-foreground: #64748B;
          --border: #E2E8F0;
          --input: #E2E8F0;
          --ring: #E63946;
        }
      `}</style>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 md:z-40 md:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 transition-transform duration-300"
        )}
      >
        <Sidebar className="shadow-xl md:shadow-none" />
      </div>

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
