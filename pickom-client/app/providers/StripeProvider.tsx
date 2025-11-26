'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode, useMemo } from 'react';

// Load Stripe outside of component to avoid recreating the object on every render
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error(
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables'
  );
}

// Create Stripe promise (will be null if key is missing)
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

interface StripeProviderProps {
  children: ReactNode;
}

/**
 * StripeProvider component wraps the application with Stripe Elements context
 * This enables the use of Stripe Elements (CardElement, PaymentElement, etc.)
 * anywhere in the app
 */
export default function StripeProvider({ children }: StripeProviderProps) {
  const options = useMemo(
    () => ({
      // Stripe Elements appearance customization
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#1976d2', // MUI primary blue
          colorBackground: '#ffffff',
          colorText: '#000000',
          colorDanger: '#d32f2f',
          fontFamily: 'Roboto, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px',
        },
      },
      // Locale for localized error messages
      locale: 'en' as const,
    }),
    []
  );

  // If Stripe key is missing, render children without Stripe context
  if (!stripePromise) {
    console.warn('Stripe is not initialized. Payment features will not work.');
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
