'use client';

import { Box, Typography, Button, CircularProgress, Alert, Card, CardContent, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from '@mui/material';
import { ArrowBack, CreditCard, Add } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { handleMe } from '../../api/auth';
import { getUserBalance } from '../../api/user';
import { User } from '../../api/dto/user';
import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';

export default function TopUpPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('10');
  const [description, setDescription] = useState<string>('Balance top-up');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');

  // Payment method selection
  const [paymentMethodDialog, setPaymentMethodDialog] = useState(false);
  const [showCardSelector, setShowCardSelector] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await handleMe();
        const userData = userResponse.data.user;
        setUser(userData);

        const balanceResponse = await getUserBalance(userData.uid);
        setBalance(balanceResponse.balance || 0);
      } catch {
        setError('Failed to load data. Please login again.');
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleBackClick = () => {
    router.back();
  };

  const validateAmount = (value: string): boolean => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      setAmountError('Please enter a valid number');
      return false;
    }
    if (num < 1) {
      setAmountError('Minimum amount is $1');
      return false;
    }
    if (num > 1000) {
      setAmountError('Maximum amount is $1000');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    if (value) {
      validateAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !validateAmount(amount)) {
      return;
    }

    // Open payment method selection dialog
    setPaymentMethodDialog(true);
  };

  const handlePayWithCheckout = async () => {
    if (!user || !validateAmount(amount)) {
      return;
    }

    setPaymentMethodDialog(false);
    setSubmitting(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/payment/topup-balance`,
        {
          amount: parseFloat(amount),
          description: description,
        },
        {
          withCredentials: true,
        }
      );

      const { url } = response.data;
      toast.success('Redirecting to payment page...');

      window.location.href = url;
    } catch (err) {
      let errorMessage = 'Unknown error occurred';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string }; status: number } };
        errorMessage = axiosError.response?.data?.message || `Server error: ${axiosError.response?.status}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(`Top-up failed: ${errorMessage}`);
      setSubmitting(false);
    }
  };

  const handlePayWithCard = async (cardId: string) => {
    if (!user || !validateAmount(amount)) {
      return;
    }

    setShowCardSelector(false);
    setPaymentMethodDialog(false);
    setSubmitting(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/payment/topup-balance`,
        {
          amount: parseFloat(amount),
          description: description,
          paymentMethodId: cardId,
        },
        {
          withCredentials: true,
        }
      );

      const { status } = response.data;

      if (status === 'succeeded') {
        toast.success('Payment successful! Balance updated.');

        // Refresh balance
        const balanceResponse = await getUserBalance(user.uid);
        setBalance(balanceResponse.balance || 0);

        // Reset form
        setAmount('10');
        setDescription('Balance top-up');
      } else if (status === 'requires_action') {
        toast.error('3D Secure authentication required. Please use Stripe Checkout instead.');
      } else {
        toast.error('Payment processing. Check your balance in a moment.');
      }

      setSubmitting(false);
    } catch (err) {
      let errorMessage = 'Unknown error occurred';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string }; status: number } };
        errorMessage = axiosError.response?.data?.message || `Server error: ${axiosError.response?.status}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(`Payment failed: ${errorMessage}`);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
        <Alert severity="error">{error || 'Failed to load data'}</Alert>
      </Box>
    );
  }

  return (
    <>
      <MobileContainer showFrame={false}>
        <Box sx={{ p: 3, pb: 10, backgroundColor: 'background.default', minHeight: '100vh' }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Button
              onClick={handleBackClick}
              sx={{ minWidth: 'auto', p: 1, mr: 1 }}
            >
              <ArrowBack />
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Top Up Balance
            </Typography>
          </Box>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Current Balance
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                ${balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Amount (USD)"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                error={!!amountError}
                helperText={amountError || 'Minimum: $1, Maximum: $1000'}
                inputProps={{
                  min: 1,
                  max: 1000,
                  step: 0.01,
                }}
                required
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={2}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={submitting || !!amountError}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Continue to Payment'}
            </Button>
          </form>
        </Box>
      </MobileContainer>
      <BottomNavigation />

      {/* Payment Method Selection Dialog */}
      <Dialog
        open={paymentMethodDialog}
        onClose={() => setPaymentMethodDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>Select Payment Method</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose how you want to pay for this top-up of ${parseFloat(amount).toFixed(2)}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Pay with Saved Card */}
              <Button
                variant="outlined"
                startIcon={<CreditCard />}
                onClick={() => setShowCardSelector(true)}
                fullWidth
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                }}
              >
                Pay with Saved Card
              </Button>

              {/* Pay with Stripe Checkout (New Card) */}
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handlePayWithCheckout}
                fullWidth
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                }}
              >
                Pay with New Card (Stripe Checkout)
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="caption" color="text.secondary">
              All payments are securely processed by Stripe
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentMethodDialog(false)} color="inherit">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Card Selector Modal */}
      <PaymentMethodSelector
        open={showCardSelector}
        onClose={() => setShowCardSelector(false)}
        onCardSelected={handlePayWithCard}
        title="Select Card for Top-Up"
      />
    </>
  );
}
