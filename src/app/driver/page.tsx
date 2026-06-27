"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DriverDashboard() {
  const [packages, setPackages] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/packages").then(r => r.json()),
      fetch("/api/drivers").then(r => r.json())
    ]).then(([pkgs, drs]) => {
      setPackages(pkgs.filter((p: any) => p.status === "pending"));
      setDrivers(drs);
      setLoading(false);
    });
  }, []);

  const handleAccept = async (packageId: number, driverId: number) => {
    const response = await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", packageId, driverId })
    });
    if (response.ok) {
      setPackages(packages.filter((p: any) => p.id !== packageId));
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Available Packages</h3>
            <p className="text-3xl font-bold">{packages.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Drivers</h3>
            <p className="text-3xl font-bold">{drivers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Available Now</h3>
            <p className="text-3xl font-bold text-green-600">{drivers.filter((d: any) => d.isAvailable).length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Average Rating</h3>
            <p className="text-3xl font-bold">
              {(drivers.reduce((sum: number, d: any) => sum + (d.rating || 0), 0) / drivers.length || 0).toFixed(1)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Available Shipments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pkg.trackingNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pkg.senderAddress} → {pkg.recipientAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pkg.weight} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${pkg.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleAccept(pkg.id, 1)}
                        className="text-blue-600 hover:underline"
                      >
                        Accept
                      </button>
                    </td>
                  </tr>
                ))}
                {packages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No available shipments</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}