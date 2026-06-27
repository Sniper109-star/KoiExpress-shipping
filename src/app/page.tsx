import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">SwiftShip</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/track" className="text-gray-600 hover:text-gray-900">Track Package</Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Fast & Reliable Delivery Services</h1>
          <p className="text-xl text-gray-600 mb-8">Ship your packages anywhere with real-time tracking</p>
          <Link href="/create-shipment" className="bg-blue-600 text-white px-8 py-3 text-lg rounded-md hover:bg-blue-700 inline-block">
            Create Shipment
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
            <p className="text-gray-600">Track your package from pickup to delivery</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-3-3h-4m-5 0H5a3 3 0 00-3 3v2h5m-3 0h12"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional Drivers</h3>
            <p className="text-gray-600">Experienced drivers at your service</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .896-3 2s1.343 2 3 2 3-.896 3-2-1.343-2-3-2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Competitive Pricing</h3>
            <p className="text-gray-600">Transparent pricing with no hidden fees</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Track Your Package</h2>
          <form action="/track" className="flex max-w-lg mx-auto">
            <input
              type="text"
              name="trackingNumber"
              placeholder="Enter tracking number (e.g., DEL12345678AB)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700">
              Track
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}