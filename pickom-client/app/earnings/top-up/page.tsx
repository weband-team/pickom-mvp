'use client';

import { Box, Typography, Button, CircularProgress, Alert, Card, CardContent, TextField } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { handleMe } from '../../api/auth';
import { getUserBalance } from '../../api/user';
import { User } from '../../api/dto/user';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await handleMe();
        const userData = userResponse.data.user;
        setUser(userData);

        const balanceResponse = await getUserBalance(userData.uid);
        setBalance(balanceResponse.balance || 0);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
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

      console.log('Balance top-up session created');
      toast.success('Redirecting to payment page...');

      window.location.href = url;
    } catch (error) {
      console.error('Balance top-up error:', error);

      let errorMessage = 'Unknown error occurred';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status: number } };
        errorMessage = axiosError.response?.data?.message || `Server error: ${axiosError.response?.status}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(`Top-up failed: ${errorMessage}`);
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        p: 2,
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 375, height: 812 }}>
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

              <Alert severity="info" sx={{ mb: 3 }}>
                You will be redirected to Stripe Checkout to complete the payment securely.
              </Alert>

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
      </Box>
    </Box>
  );
}
