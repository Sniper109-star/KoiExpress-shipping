import Link from "next/link";
import { db } from "@/db";
import { packages, drivers } from "@/db/schema";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";

export default async function AdminDashboard() {
  const allPackages = await db.select().from(packages);
  const allDrivers = await db.select().from(drivers);

  const stats = {
    totalPackages: allPackages.length,
    pendingPackages: allPackages.filter(p => p.status === "pending").length,
    inTransitPackages: allPackages.filter(p => p.status === "in_transit").length,
    deliveredPackages: allPackages.filter(p => p.status === "delivered").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Shipments</h3>
            <p className="text-3xl font-bold">{stats.totalPackages}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingPackages}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">In Transit</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.inTransitPackages}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Delivered</h3>
            <p className="text-3xl font-bold text-green-600">{stats.deliveredPackages}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Active Shipments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allPackages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pkg.trackingNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pkg.senderAddress} → {pkg.recipientAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[pkg.status || "pending"]}`}>
                        {STATUS_LABELS[pkg.status || "pending"]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pkg.driverId ? `Driver #${pkg.driverId}` : "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/track?trackingNumber=${pkg.trackingNumber}`} className="text-blue-600 hover:underline">Track</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Drivers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allDrivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.vehicleType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {driver.isAvailable ? "Available" : "Busy"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.rating}/5.0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}