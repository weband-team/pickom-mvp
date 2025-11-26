'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import CardsList from '../components/payment/CardsList';
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';

const API_URL = process.env.NEXT_PUBLIC_SERVER || 'http://localhost:4242';

export default function PaymentTestPage() {
  // State for card management
  const [cardsKey, setCardsKey] = useState(0);

  // State for payment simulation
  const [paymentAmount, setPaymentAmount] = useState('100');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // State for balance top-up
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [topUpCardId, setTopUpCardId] = useState<string | null>(null);
  const [showTopUpCardSelector, setShowTopUpCardSelector] = useState(false);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpResult, setTopUpResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Refresh cards list
  const refreshCards = () => {
    setCardsKey((prev) => prev + 1);
  };

  // Handle card selection for payment
  const handleSelectCardForPayment = (cardId: string) => {
    setSelectedCardId(cardId);
    setShowCardSelector(false);
    setPaymentResult(null);
  };

  // Handle card selection for top-up
  const handleSelectCardForTopUp = (cardId: string) => {
    setTopUpCardId(cardId);
    setShowTopUpCardSelector(false);
    setTopUpResult(null);
  };

  // Simulate payment with selected card
  const handleSimulatePayment = async () => {
    if (!selectedCardId) {
      setPaymentResult({
        success: false,
        message: 'Please select a card first',
      });
      return;
    }

    setPaymentLoading(true);
    setPaymentResult(null);

    try {
      const response = await axios.post(
        `${API_URL}/payment/create-intent`,
        {
          amount: parseInt(paymentAmount),
          currency: 'rub',
          description: 'Test payment',
          paymentMethodId: selectedCardId,
        },
        { withCredentials: true }
      );

      setPaymentResult({
        success: true,
        message: `Payment Intent created! ID: ${response.data.clientSecret?.substring(0, 20)}...`,
      });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setPaymentResult({
        success: false,
        message: error.response?.data?.message || error.message || 'Payment failed',
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  // Simulate balance top-up
  const handleSimulateTopUp = async () => {
    if (!topUpCardId) {
      setTopUpResult({
        success: false,
        message: 'Please select a card first',
      });
      return;
    }

    setTopUpLoading(true);
    setTopUpResult(null);

    try {
      const response = await axios.post(
        `${API_URL}/payment/topup-balance`,
        {
          amount: parseInt(topUpAmount),
          description: 'Balance top-up',
          paymentMethodId: topUpCardId,
        },
        { withCredentials: true }
      );

      setTopUpResult({
        success: true,
        message: `Top-up initiated! Status: ${response.data.status}, Intent ID: ${response.data.paymentIntentId?.substring(0, 15)}...`,
      });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setTopUpResult({
        success: false,
        message: error.response?.data?.message || error.message || 'Top-up failed',
      });
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Payment Cards Test Page
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Test all payment card functionality here
      </Typography>

      {/* Section 1: Card Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            1. Manage Saved Cards
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            View, add, delete cards and set default
          </Typography>

          <CardsList
            key={cardsKey}
            onCardDeleted={refreshCards}
            onDefaultChanged={refreshCards}
          />
        </CardContent>
      </Card>

      {/* Section 2: Payment with Card Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            2. Simulate Payment with Card Selection
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a card and create a payment intent
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <TextField
              label="Amount (RUB)"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              size="small"
              sx={{ width: 150 }}
            />

            <Button
              variant="outlined"
              onClick={() => setShowCardSelector(true)}
              sx={{ flexGrow: 1 }}
            >
              {selectedCardId
                ? `Card selected: ...${selectedCardId.slice(-8)}`
                : 'Select Payment Card'
              }
            </Button>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleSimulatePayment}
            disabled={paymentLoading || !selectedCardId}
          >
            {paymentLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              `Pay ${paymentAmount} RUB`
            )}
          </Button>

          {paymentResult && (
            <Alert
              severity={paymentResult.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {paymentResult.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Balance Top-up */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            3. Simulate Balance Top-up
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Top up account balance with selected card
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <TextField
              label="Amount (RUB)"
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              size="small"
              sx={{ width: 150 }}
            />

            <Button
              variant="outlined"
              onClick={() => setShowTopUpCardSelector(true)}
              sx={{ flexGrow: 1 }}
            >
              {topUpCardId
                ? `Card selected: ...${topUpCardId.slice(-8)}`
                : 'Select Card for Top-up'
              }
            </Button>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleSimulateTopUp}
            disabled={topUpLoading || !topUpCardId}
          >
            {topUpLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              `Top Up ${topUpAmount} RUB`
            )}
          </Button>

          {topUpResult && (
            <Alert
              severity={topUpResult.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {topUpResult.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Test Cards Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            4. Test Card Numbers
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Basic Cards:
          </Typography>
          <Typography variant="body2" component="div" sx={{ mb: 2, fontFamily: 'monospace' }}>
            • 4242 4242 4242 4242 - Visa (success)<br />
            • 5555 5555 5555 4444 - Mastercard (success)<br />
            • 4000 0000 0000 0002 - Declined
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            3D Secure Cards:
          </Typography>
          <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace' }}>
            • 4000 0025 0000 3155 - Requires 3DS (success)<br />
            • 4000 0000 0000 3063 - Requires 3DS (failed)
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Use any future date for expiry and any 3 digits for CVC
          </Typography>
        </CardContent>
      </Card>

      {/* Card Selector Modal for Payment */}
      <PaymentMethodSelector
        open={showCardSelector}
        onClose={() => setShowCardSelector(false)}
        onCardSelected={handleSelectCardForPayment}
        title="Select Card for Payment"
      />

      {/* Card Selector Modal for Top-up */}
      <PaymentMethodSelector
        open={showTopUpCardSelector}
        onClose={() => setShowTopUpCardSelector(false)}
        onCardSelected={handleSelectCardForTopUp}
        title="Select Card for Top-up"
      />
    </Box>
  );
}
