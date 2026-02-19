'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, CircularProgress, Alert, Box, Typography } from '@mui/material';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface AddCardFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * AddCardForm component for securely adding payment cards
 * Features:
 * - Stripe Elements for PCI compliance
 * - Automatic 3D Secure handling
 * - Real-time validation
 * - Material UI styling
 */
export default function AddCardForm({
  onSuccess,
  onCancel,
}: AddCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Get Setup Intent from backend
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/payment/cards/setup-intent`,
        {},
        { withCredentials: true }
      );

      const { clientSecret } = data;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // 2. Confirm Setup Intent (Stripe will automatically show 3DS modal if needed)
      const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (confirmError) {
        setError(confirmError.message || 'Card verification failed');
        toast.error('Failed to add card');
        return;
      }

      if (setupIntent?.status === 'succeeded') {
        const paymentMethodId = setupIntent.payment_method as string;

        // 3. Attach Payment Method to Customer
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER}/payment/cards/attach`,
          { paymentMethodId },
          { withCredentials: true }
        );

        toast.success('Card added successfully!');
        onSuccess?.();
      }
    } catch (err) {
      console.error('Error adding card:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message || 'Failed to add card. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Add Payment Card
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          p: 2,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          mb: 3,
          backgroundColor: '#f5f5f5',
        }}
      >
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#000000',
                fontFamily: 'Roboto, sans-serif',
                '::placeholder': {
                  color: '#757575',
                },
              },
              invalid: {
                color: '#d32f2f',
              },
            },
            hidePostalCode: true,
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {onCancel && (
          <Button
            onClick={onCancel}
            disabled={loading}
            fullWidth
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!stripe || loading}
          fullWidth
          variant="contained"
          size="large"
        >
          {loading ? <CircularProgress size={24} /> : 'Add Card'}
        </Button>
      </Box>
    </Box>
  );
}
