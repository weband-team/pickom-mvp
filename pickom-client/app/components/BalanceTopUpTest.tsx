'use client';

import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface BalanceTopUpFormData {
  userId: string;
  amount: number;
  description: string;
}

export default function BalanceTopUpTest() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BalanceTopUpFormData>({
    userId: '',
    amount: 10.0,
    description: 'Balance top-up',
  });
  const [status, setStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      // Create balance top-up session on the server
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/payment/topup-balance`,
        {
          userId: formData.userId,
          amount: formData.amount,
          description: formData.description,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { url, sessionId } = response.data;

      console.log('Balance top-up session created:', { url, sessionId });
      toast.success('Redirecting to payment page...');

      // Redirect to Stripe Checkout page
      window.location.href = url;
    } catch (error: any) {
      console.error('Balance top-up error:', error);
      console.error('Error response:', error.response);

      let errorMessage = 'Unknown error occurred';

      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setStatus(`Top-up failed: ${errorMessage}`);
      toast.error(`Top-up failed: ${errorMessage}`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Balance Top-Up Test
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID (Firebase UID)
          </label>
          <input
            type="text"
            value={formData.userId}
            onChange={(e) =>
              setFormData({ ...formData, userId: e.target.value })
            }
            placeholder="Enter Firebase UID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the Firebase UID of the user whose balance you want to top up
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USD)
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: parseFloat(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g., Balance top-up"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            <strong>Test Card Numbers:</strong>
          </p>
          <ul className="text-xs text-yellow-700 mt-2 space-y-1">
            <li>Success: 4242 4242 4242 4242</li>
            <li>Declined: 4000 0000 0000 0002</li>
            <li>Any future expiry date and CVC</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.userId}
          className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors ${
            loading || !formData.userId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Processing...' : `Top Up $${formData.amount.toFixed(2)}`}
        </button>
      </form>

      {status && (
        <div
          className={`mt-4 p-4 rounded-md ${
            status.includes('successful')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {status}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>How it works:</strong>
        </p>
        <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
          <li>Enter a valid Firebase UID</li>
          <li>Specify the amount to add to the user&apos;s balance</li>
          <li>Complete payment via Stripe Checkout</li>
          <li>User&apos;s balance will be updated automatically</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> This is a test component using Stripe test mode.
          Use test card numbers above for testing payments.
        </p>
      </div>
    </div>
  );
}
