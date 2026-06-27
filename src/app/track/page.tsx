import Link from "next/link";

export default function TrackPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/" className="text-sm underline mb-4 inline-block">← Back to Home</Link>
      <h1 className="text-3xl font-bold mb-4">Track Package</h1>
      <p className="text-muted-foreground">
        Enter tracking number to see shipment status.
      </p>
    </div>
  );
}