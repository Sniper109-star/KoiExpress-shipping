import Link from "next/link";

export default function CreateShipmentPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/" className="text-sm underline mb-4 inline-block">← Back to Home</Link>
      <h1 className="text-3xl font-bold mb-4">Create Shipment</h1>
      <p className="text-muted-foreground">
        Please sign in to create shipments. This page requires authentication.
      </p>
      <Link href="/login" className="inline-block mt-4">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Sign In</button>
      </Link>
    </div>
  );
}