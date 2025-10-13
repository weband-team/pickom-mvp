'use client';

import { useReducer, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Stack, Alert } from '@mui/material';
import {
  Button,
  TextInput,
  Select,
  MobileContainer,
  PickomLogo
} from '../../components/ui';
import { UserType, DeliveryMethod, BaseUserData, PickerSpecificData } from '../../types/auth';
import Link from 'next/link';
import {
  validateEmail,
  validatePassword,
  validateAge,
  validateFullName,
  validatePhoneNumber,
  validateCountry,
  validateCity,
  validatePasswordConfirmation,
} from '../../utils/validation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';
import { handleRegister as registerWithBackend } from '../api/auth';

interface RegistrationState {
  step: 'userData' | 'pickerData';
  selectedUserType: UserType | null;
  userData: Partial<BaseUserData>;
  pickerData: Partial<PickerSpecificData>;
  password: string;
  confirmPassword: string;
  errors: {
    fullName?: string;
    email?: string;
    age?: string;
    country?: string;
    city?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  };
}

type RegistrationAction =
  | { type: 'UPDATE_USER_DATA'; payload: Partial<BaseUserData> }
  | { type: 'UPDATE_PICKER_DATA'; payload: Partial<PickerSpecificData> }
  | { type: 'UPDATE_PASSWORD'; payload: string }
  | { type: 'UPDATE_CONFIRM_PASSWORD'; payload: string }
  | { type: 'SET_ERRORS'; payload: Partial<RegistrationState['errors']> }
  | { type: 'CLEAR_ERROR'; payload: keyof RegistrationState['errors'] }
  | { type: 'SET_USER_TYPE'; payload: UserType }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' };

const initialState: RegistrationState = {
  step: 'userData',
  selectedUserType: null,
  userData: {},
  pickerData: {},
  password: '',
  confirmPassword: '',
  errors: {}
};

function registrationReducer(state: RegistrationState, action: RegistrationAction): RegistrationState {
  switch (action.type) {
    case 'UPDATE_USER_DATA':
      return {
        ...state,
        userData: { ...state.userData, ...action.payload }
      };
    case 'UPDATE_PICKER_DATA':
      return {
        ...state,
        pickerData: { ...state.pickerData, ...action.payload }
      };
    case 'UPDATE_PASSWORD':
      return {
        ...state,
        password: action.payload
      };
    case 'UPDATE_CONFIRM_PASSWORD':
      return {
        ...state,
        confirmPassword: action.payload
      };
    case 'SET_ERRORS':
      return {
        ...state,
        errors: { ...state.errors, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload]: undefined }
      };
    case 'SET_USER_TYPE':
      return {
        ...state,
        selectedUserType: action.payload
      };
    case 'NEXT_STEP':
      if (state.step === 'userData' && state.selectedUserType === UserType.PICKER) {
        return { ...state, step: 'pickerData' };
      }
      return state;
    case 'PREV_STEP':
      if (state.step === 'pickerData') {
        return { ...state, step: 'userData' };
      }
      return state;
    default:
      return state;
  }
}

export default function RegisterPage() {
  const [state, dispatch] = useReducer(registrationReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Get user type from session storage (set in user-type page)
  useEffect(() => {
    const selectedUserType = sessionStorage.getItem('selectedUserType') as UserType;
    if (!selectedUserType) {
      router.push('/user-type');
      return;
    }
    dispatch({ type: 'SET_USER_TYPE', payload: selectedUserType });
  }, [router]);

  const validateField = (field: string, value: string | number) => {
    let validation;
    const stringValue = String(value);
    switch (field) {
      case 'fullName':
        validation = validateFullName(stringValue);
        break;
      case 'email':
        validation = validateEmail(stringValue);
        break;
      case 'age':
        validation = validateAge(Number(value));
        break;
      case 'country':
        validation = validateCountry(stringValue);
        break;
      case 'city':
        validation = validateCity(stringValue);
        break;
      case 'phoneNumber':
        validation = validatePhoneNumber(stringValue);
        break;
      case 'password':
        validation = validatePassword(stringValue);
        break;
      case 'confirmPassword':
        validation = validatePasswordConfirmation(state.password, stringValue);
        break;
      default:
        return;
    }

    if (validation.isValid) {
      dispatch({ type: 'CLEAR_ERROR', payload: field as keyof RegistrationState['errors'] });
    } else {
      dispatch({
        type: 'SET_ERRORS',
        payload: { [field]: validation.error }
      });
    }
  };

  const handleInputChange = (field: keyof BaseUserData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'age' ? parseInt(e.target.value) || 0 : e.target.value;
    dispatch({
      type: 'UPDATE_USER_DATA',
      payload: { [field]: value }
    });
    validateField(field, e.target.value);
  };

  const handlePasswordChange = (field: 'password' | 'confirmPassword') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (field === 'password') {
      dispatch({ type: 'UPDATE_PASSWORD', payload: value });
    } else {
      dispatch({ type: 'UPDATE_CONFIRM_PASSWORD', payload: value });
    }
    validateField(field, value);
  };

  const handleRegister = async () => {
    // Validate all fields before submitting
    const validations = {
      fullName: validateFullName(state.userData.fullName || ''),
      email: validateEmail(state.userData.email || ''),
      age: validateAge(state.userData.age || 0),
      country: validateCountry(state.userData.country || ''),
      city: validateCity(state.userData.city || ''),
      phoneNumber: validatePhoneNumber(state.userData.phoneNumber || ''),
      password: validatePassword(state.password),
      confirmPassword: validatePasswordConfirmation(state.password, state.confirmPassword)
    };

    const errors: Partial<RegistrationState['errors']> = {};
    let hasErrors = false;

    Object.entries(validations).forEach(([field, validation]) => {
      if (!validation.isValid) {
        errors[field as keyof RegistrationState['errors']] = validation.error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      dispatch({ type: 'SET_ERRORS', payload: errors });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        state.userData.email!,
        state.password
      );

      // Step 2: Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // Step 3: Register with backend
      const role = state.selectedUserType === UserType.PICKER ? 'picker' : 'sender';
      const response = await registerWithBackend(
        role,
        idToken,
        state.userData.phoneNumber,
        state.userData.fullName
      );

      // Step 4: Redirect based on user role
      if (role === 'picker') {
        router.push('/available-deliveries');
      } else {
        router.push('/delivery-methods');
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle Firebase-specific errors
      let errorMessage = 'Registration failed. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isUserDataComplete = () => {
    const { fullName, email, age, country, city } = state.userData;
    return fullName && email && age && country && city && state.password && state.confirmPassword;
  };

  const isPickerDataComplete = () => {
    return state.pickerData.deliveryMethods && state.pickerData.deliveryMethods.length > 0;
  };

  const userType = state.selectedUserType;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
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
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {userType === UserType.SENDER ? '📦 Sender' : '🚀 Picker'} Registration
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Step 1: User Data */}
          {state.step === 'userData' && (
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Tell us about yourself
                </Typography>
              </Box>

              <TextInput
                label="Full Name"
                value={state.userData.fullName || ''}
                onChange={handleInputChange('fullName')}
                error={!!state.errors.fullName}
                helperText={state.errors.fullName}
                fullWidth
                required
              />

              <TextInput
                label="Email"
                type="email"
                value={state.userData.email || ''}
                onChange={handleInputChange('email')}
                error={!!state.errors.email}
                helperText={state.errors.email}
                fullWidth
                required
              />

              <TextInput
                label="Age"
                type="number"
                value={state.userData.age || ''}
                onChange={handleInputChange('age')}
                error={!!state.errors.age}
                helperText={state.errors.age}
                fullWidth
                required
              />

              <TextInput
                label="Country"
                value={state.userData.country || ''}
                onChange={handleInputChange('country')}
                error={!!state.errors.country}
                helperText={state.errors.country}
                fullWidth
                required
              />

              <TextInput
                label="City"
                value={state.userData.city || ''}
                onChange={handleInputChange('city')}
                error={!!state.errors.city}
                helperText={state.errors.city}
                fullWidth
                required
              />

              <TextInput
                label="Phone Number (Optional)"
                placeholder="e.g., +1234567890"
                value={state.userData.phoneNumber || ''}
                onChange={handleInputChange('phoneNumber')}
                error={!!state.errors.phoneNumber}
                helperText={state.errors.phoneNumber || 'International format with country code'}
                fullWidth
              />

              <TextInput
                label="Password"
                type="password"
                value={state.password}
                onChange={handlePasswordChange('password')}
                error={!!state.errors.password}
                helperText={state.errors.password || 'Minimum 8 characters with letters and numbers'}
                fullWidth
                required
              />

              <TextInput
                label="Confirm Password"
                type="password"
                value={state.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                error={!!state.errors.confirmPassword}
                helperText={state.errors.confirmPassword}
                fullWidth
                required
              />

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/user-type')}
                  fullWidth
                >
                  Back
                </Button>

                {userType === UserType.SENDER ? (
                  <Button
                    onClick={handleRegister}
                    disabled={!isUserDataComplete() || Object.values(state.errors).some(error => !!error) || isLoading}
                    fullWidth
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => dispatch({ type: 'NEXT_STEP' })}
                    disabled={!isUserDataComplete() || Object.values(state.errors).some(error => !!error) || isLoading}
                    fullWidth
                  >
                    Next
                  </Button>
                )}
              </Stack>
            </Stack>
          )}

          {/* Step 2: Picker Specific Data */}
          {state.step === 'pickerData' && userType === UserType.PICKER && (
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  🚀 Picker Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tell us about your delivery preferences
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Delivery Methods (Select all that apply):
                </Typography>
                <Stack spacing={1}>
                  {Object.values(DeliveryMethod).map((method) => (
                    <Button
                      key={method}
                      variant={state.pickerData.deliveryMethods?.includes(method) ? 'contained' : 'outlined'}
                      onClick={() => {
                        const currentMethods = state.pickerData.deliveryMethods || [];
                        const newMethods = currentMethods.includes(method)
                          ? currentMethods.filter(m => m !== method)
                          : [...currentMethods, method];
                        dispatch({
                          type: 'UPDATE_PICKER_DATA',
                          payload: { deliveryMethods: newMethods }
                        });
                      }}
                      fullWidth
                    >
                      {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                </Stack>
              </Box>

              <Select
                label="Vehicle Type"
                value={state.pickerData.vehicleType || ''}
                onChange={(value) => dispatch({
                  type: 'UPDATE_PICKER_DATA',
                  payload: { vehicleType: value as 'car' | 'bike' | 'walking' | 'public_transport' }
                })}
                options={[
                  { value: 'car', label: '🚗 Car' },
                  { value: 'bike', label: '🏍️ Bike' },
                  { value: 'walking', label: '🚶 Walking' },
                  { value: 'public_transport', label: '🚌 Public Transport' }
                ]}
                fullWidth
              />

              <TextInput
                label="Bio (Optional)"
                value={state.pickerData.bio || ''}
                onChange={(e) => dispatch({
                  type: 'UPDATE_PICKER_DATA',
                  payload: { bio: e.target.value }
                })}
                multiline
                rows={3}
                fullWidth
                placeholder="Tell senders about yourself and your delivery experience..."
              />

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => dispatch({ type: 'PREV_STEP' })}
                  fullWidth
                >
                  Back
                </Button>

                <Button
                  onClick={handleRegister}
                  disabled={!isPickerDataComplete() || isLoading}
                  fullWidth
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Stack>
            </Stack>
          )}

          {/* Login Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Already have an account?
            </Typography>
            <Link href="/" passHref>
              <Button variant="outlined" fullWidth>
                Sign In
              </Button>
            </Link>
          </Box>
        </Box>
      </MobileContainer>
    </Box>
  );
}