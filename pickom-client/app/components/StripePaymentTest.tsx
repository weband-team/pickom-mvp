'use client';

import React, { useState } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import axios from 'axios';
import toast from 'react-hot-toast';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

console.log('Stripe Publishable Key:', publishableKey);
console.log('All env vars:', process.env);

if (!publishableKey) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
}

const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface PaymentFormData {
  amount: number;
  deliveryId: number;
  description: string;
}

export default function StripePaymentTest() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 10.0,
    deliveryId: 1,
    description: 'Test payment for delivery',
  });
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPaymentStatus('');

    try {
      // Create Checkout Session on the server
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/payment/create-checkout-session`,
        {
          amount: formData.amount,
          deliveryId: formData.deliveryId,
          description: formData.description,
          currency: 'usd',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { url } = response.data;

      // Redirect to Stripe Checkout page
      window.location.href = url;
    } catch (error: any) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Server URL:', process.env.NEXT_PUBLIC_SERVER);

      let errorMessage = 'Unknown error occurred';

      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setPaymentStatus(`Payment failed: ${errorMessage}`);
      toast.error(`Payment failed: ${errorMessage}`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Stripe Payment Test
      </h2>

      {!publishableKey && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined.
            Please check your .env file and restart the dev server.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USD)
          </label>
          <input
            type="number"
            step="0.01"
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
            Delivery ID
          </label>
          <input
            type="number"
            value={formData.deliveryId}
            onChange={(e) =>
              setFormData({ ...formData, deliveryId: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
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
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processing...' : `Pay $${formData.amount.toFixed(2)}`}
        </button>
      </form>

      {paymentStatus && (
        <div
          className={`mt-4 p-4 rounded-md ${
            paymentStatus.includes('successful')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {paymentStatus}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> This is a test component using Stripe test mode.
          Use test card numbers above for testing payments.
        </p>
      </div>
    </div>
  );
}
