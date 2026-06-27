import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SwiftShip - Logistics & Delivery Platform",
  description: "Enterprise logistics and delivery management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-background min-h-screen">
        {children}
      </body>
    </html>
  );
}