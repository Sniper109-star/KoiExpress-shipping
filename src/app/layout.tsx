import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { SmartsuppWidget } from "@/components/smartsupp-widget";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Unifet Logistics — Move with clarity",
  description: "Unifet Logistics coordinates reliable shipping, live fleet visibility, and delivery operations across every mile.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
      <body className="antialiased bg-background min-h-screen font-sans">
        {children}
        <SmartsuppWidget />
      </body>
    </html>
  );
}
