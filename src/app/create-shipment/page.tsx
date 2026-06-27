"use client";

import Link from "next/link";
import { useState } from "react";

export default function CreateShipment() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      senderName: formData.get("senderName") as string,
      senderEmail: formData.get("senderEmail") as string,
      senderPhone: formData.get("senderPhone") as string,
      senderAddress: formData.get("senderAddress") as string,
      recipientName: formData.get("recipientName") as string,
      recipientEmail: formData.get("recipientEmail") as string,
      recipientPhone: formData.get("recipientPhone") as string,
      recipientAddress: formData.get("recipientAddress") as string,
      weight: formData.get("weight") as string,
      dimensions: formData.get("dimensions") as string,
      description: formData.get("description") as string,
    };

    const response = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Home</Link>
        
        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Shipment created successfully!
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Shipment</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Sender Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input name="senderName" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input name="senderEmail" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input name="senderPhone" type="tel" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input name="senderAddress" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Recipient Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input name="recipientName" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input name="recipientEmail" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input name="recipientPhone" type="tel" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input name="recipientAddress" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Package Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input name="weight" type="number" step="0.1" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dimensions (LxWxH cm)</label>
                    <input name="dimensions" type="text" placeholder="e.g., 30x20x15" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 text-lg font-medium disabled:opacity-50">
                {loading ? "Creating..." : "Create Shipment"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}