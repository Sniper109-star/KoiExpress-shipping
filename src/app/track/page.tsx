import Link from "next/link";
import { db } from "@/db";
import { packages, trackingEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Track({ searchParams }: { searchParams: Promise<{ trackingNumber?: string }> }) {
  const params = await searchParams;
  const trackingNumber = params.trackingNumber;
  
  let packageData = null;
  if (trackingNumber) {
    const pkg = await db.select().from(packages).where(eq(packages.trackingNumber, trackingNumber)).limit(1);
    if (pkg[0]) {
      const events = await db.select().from(trackingEvents).where(eq(trackingEvents.packageId, pkg[0].id));
      packageData = { ...pkg[0], events };
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Home</Link>
        
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Track Your Package</h1>
          <form className="flex gap-4">
            <input
              type="text"
              name="trackingNumber"
              placeholder="Enter tracking number (e.g., DEL12345678AB)"
              defaultValue={trackingNumber || ""}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
              Track
            </button>
          </form>
        </div>

        {packageData ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold">Tracking Number: {packageData.trackingNumber}</h2>
              <p className="text-gray-600">Status: <span className="font-semibold capitalize">{packageData.status?.replace("_", " ")}</span></p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">From</h3>
                  <p>{packageData.senderName}</p>
                  <p className="text-sm text-gray-600">{packageData.senderAddress}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">To</h3>
                  <p>{packageData.recipientName}</p>
                  <p className="text-sm text-gray-600">{packageData.recipientAddress}</p>
                </div>
              </div>
              <div>
                <p><strong>Weight:</strong> {packageData.weight} kg</p>
                <p><strong>Description:</strong> {packageData.description}</p>
                <p><strong>Price:</strong> ${packageData.price}</p>
              </div>
            </div>

            {packageData.events && packageData.events.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Tracking History</h3>
                <div className="space-y-4">
                  {packageData.events.map((event) => (
                    <div key={event.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{event.status?.replace("_", " ")}</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                        <p className="text-sm text-gray-500">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : trackingNumber ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Package not found. Please check the tracking number.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}