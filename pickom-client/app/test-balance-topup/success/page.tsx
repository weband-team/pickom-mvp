'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BalanceTopUpSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Balance Top-Up Successful!
          </h1>

          <p className="mt-4 text-gray-600">
            Your balance has been successfully topped up. The funds will be available in your account shortly.
          </p>

          {sessionId && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500 font-mono break-all">
                Session ID: {sessionId}
              </p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <Link
              href="/test-balance-topup"
              className="block w-full py-3 px-4 rounded-md font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Top Up Again
            </Link>

            <Link
              href="/"
              className="block w-full py-3 px-4 rounded-md font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
