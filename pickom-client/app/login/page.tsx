'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Stack, Alert } from '@mui/material';
import {
  Button,
  TextInput,
  MobileContainer,
  PickomLogo
} from '../../components/ui';
import { LoginRequest } from '../../types/auth';
import Link from 'next/link';
import { validateEmail, validatePassword } from '../../utils/validation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';
import { handleLogin as loginWithBackend } from '../api/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const router = useRouter();

  const validateField = (field: keyof LoginRequest, value: string) => {
    const validation = field === 'email' ? validateEmail(value) : validatePassword(value);

    if (validation.isValid) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    } else {
      setFieldErrors(prev => ({ ...prev, [field]: validation.error }));
    }
  };

  const handleInputChange = (field: keyof LoginRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear global error when user starts typing
    if (error) setError('');
    // Validate field on change
    validateField(field, value);
  };

  const handleLogin = async () => {
    // Validate fields before submitting
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);

    const newFieldErrors: { email?: string; password?: string } = {};

    if (!emailValidation.isValid) {
      newFieldErrors.email = emailValidation.error;
    }
    if (!passwordValidation.isValid) {
      newFieldErrors.password = passwordValidation.error;
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsLoading(true);
    setError('');
    setFieldErrors({});

    try {
      // Step 1: Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Step 2: Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // Step 3: Send token to backend to verify user exists and create session
      const response = await loginWithBackend(idToken);

      // Step 4: Redirect based on user role
      if (response.data.role === 'picker') {
        router.push('/available-deliveries');
      } else {
        router.push('/delivery-methods');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle Firebase-specific errors
      let errorMessage = 'Invalid email or password. Please try again.';

      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const isFormValid = formData.email && formData.password &&
                      !fieldErrors.email && !fieldErrors.password;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <MobileContainer showFrame={false}>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <PickomLogo variant="full" size="large" />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your Pickom account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Stack spacing={3}>
            <TextInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              onKeyPress={handleKeyPress}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              fullWidth
              required
              autoComplete="email"
            />

            <TextInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              onKeyPress={handleKeyPress}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              fullWidth
              required
              autoComplete="current-password"
            />

            <Button
              onClick={handleLogin}
              disabled={!isFormValid || isLoading}
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Stack>

          {/* Divider */}
          <Box sx={{ my: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?
            </Typography>
          </Box>

          {/* Register Link */}
          <Link href="/user-type" passHref>
            <Button
              variant="outlined"
              fullWidth
              size="large"
            >
              Create New Account
            </Button>
          </Link>

          {/* Forgot Password */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textDecoration: 'underline',
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
              onClick={() => {
                // TODO: Implement forgot password
                alert('Forgot password feature coming soon!');
              }}
            >
              Forgot your password?
            </Typography>
          </Box>
        </Box>
      </MobileContainer>
    </Box>
  );
}