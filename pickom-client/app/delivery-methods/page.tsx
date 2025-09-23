'use client';

import { useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Stack } from '@mui/material';
import {
  Button,
  TextInput,
  Select,
  DateTimePicker,
  MobileContainer,
  PickomLogo
} from '../components/ui';
import { useDeliveryActions, useIsSearchingPickers } from '../hooks/use-delivery-store';
import { PickerSearchLoader } from '../components/PickerSearchLoader';
import { DeliveryMethodType } from '../types/delivery';

interface DeliveryFormState {
  selectedMethod: DeliveryMethodType | '';
  withinCity: {
    pickupLocation: string;
    dropoffLocation: string;
    pickupDateTime: Date | null;
  };
  interCity: {
    senderCity: string;
    senderAddress: string;
    deliveryCity: string;
    deliveryAddress: string;
    preferredDeliveryDate: Date | null;
  };
  international: {
    pickupCountry: string;
    pickupCity: string;
    pickupAddress: string;
    destinationCountry: string;
    destinationCity: string;
    destinationAddress: string;
    deliveryDate: Date | null;
  };
}

type DeliveryFormAction =
  | { type: 'SET_METHOD'; payload: DeliveryMethodType | '' }
  | { type: 'SET_WITHIN_CITY_FIELD'; field: keyof DeliveryFormState['withinCity']; value: string | Date | null }
  | { type: 'SET_INTER_CITY_FIELD'; field: keyof DeliveryFormState['interCity']; value: string | Date | null }
  | { type: 'SET_INTERNATIONAL_FIELD'; field: keyof DeliveryFormState['international']; value: string | Date | null | number }
  | { type: 'RESET' };

const initialState: DeliveryFormState = {
  selectedMethod: '',
  withinCity: {
    pickupLocation: '',
    dropoffLocation: '',
    pickupDateTime: null,
  },
  interCity: {
    senderCity: '',
    senderAddress: '',
    deliveryCity: '',
    deliveryAddress: '',
    preferredDeliveryDate: null,
  },
  international: {
    pickupCountry: '',
    pickupCity: '',
    pickupAddress: '',
    destinationCountry: '',
    destinationCity: '',
    destinationAddress: '',
    deliveryDate: null,
  },
};

function deliveryFormReducer(state: DeliveryFormState, action: DeliveryFormAction): DeliveryFormState {
  switch (action.type) {
    case 'SET_METHOD':
      return { ...state, selectedMethod: action.payload };
    case 'SET_WITHIN_CITY_FIELD':
      return {
        ...state,
        withinCity: { ...state.withinCity, [action.field]: action.value },
      };
    case 'SET_INTER_CITY_FIELD':
      return {
        ...state,
        interCity: { ...state.interCity, [action.field]: action.value },
      };
    case 'SET_INTERNATIONAL_FIELD':
      return {
        ...state,
        international: { ...state.international, [action.field]: action.value },
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function SendPackagePage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(deliveryFormReducer, initialState);
  const isSearchingPickers = useIsSearchingPickers();
  const { startPickerSearch, stopPickerSearch } = useDeliveryActions();

  const deliveryMethods = [
    { id: 'within-city' as const, name: 'Within-City', description: 'Same city delivery' },
    { id: 'inter-city' as const, name: 'Inter-City', description: 'Between cities' },
    { id: 'international' as const, name: 'International', description: 'Cross-border delivery' }
  ];

  const countries = [
    { value: 'RU', label: 'Russia' },
    { value: 'KZ', label: 'Kazakhstan' },
    { value: 'UZ', label: 'Uzbekistan' },
    { value: 'KG', label: 'Kyrgyzstan' },
    { value: 'TJ', label: 'Tajikistan' },
    { value: 'BY', label: 'Belarus' },
    { value: 'AM', label: 'Armenia' },
    { value: 'AZ', label: 'Azerbaijan' },
    { value: 'GE', label: 'Georgia' },
    { value: 'MD', label: 'Moldova' },
    { value: 'US', label: 'United States' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CN', label: 'China' },
    { value: 'TR', label: 'Turkey' }
  ];

  const canRequestPicker = (() => {
    const { selectedMethod, withinCity, interCity, international } = state;

    switch (selectedMethod) {
      case 'within-city':
        return withinCity.pickupLocation && withinCity.dropoffLocation && withinCity.pickupDateTime;
      case 'inter-city':
        return interCity.senderCity && interCity.senderAddress &&
               interCity.deliveryCity && interCity.deliveryAddress && interCity.preferredDeliveryDate;
      case 'international':
        return international.pickupCountry && international.pickupCity && international.pickupAddress &&
               international.destinationCountry && international.destinationCity &&
               international.destinationAddress && international.deliveryDate;
      default:
        return false;
    }
  })();

  const handleRequestPicker = () => {
    if (canRequestPicker) {
      startPickerSearch();
    }
  };

  const handleSearchComplete = () => {
    stopPickerSearch();
    router.push('/picker-results');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        p: 2,
      }}
    >
      <MobileContainer showFrame={false}>
        <Box sx={{ p: 3, pb: 6 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <PickomLogo size="medium" />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Send a Package
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose your delivery method and provide details
            </Typography>
          </Box>

          {/* Delivery Method Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Choose Delivery Type
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {deliveryMethods.map((method) => (
                <Button
                  key={method.id}
                  selected={state.selectedMethod === method.id}
                  onClick={() => dispatch({ type: 'SET_METHOD', payload: method.id })}
                  size="small"
                  sx={{ flex: 1, flexDirection: 'column', py: 1.5 }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                    {method.name}
                  </Typography>
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Within-City Form */}
          {state.selectedMethod === 'within-city' && (
            <Stack spacing={3}>
              <Typography variant="h6">Package Details</Typography>

              <TextInput
                label="Pickup Location"
                placeholder="Enter pickup address"
                value={state.withinCity.pickupLocation}
                onChange={(e) => dispatch({
                  type: 'SET_WITHIN_CITY_FIELD',
                  field: 'pickupLocation',
                  value: e.target.value
                })}
                fullWidth
              />

              <TextInput
                label="Drop-off Location"
                placeholder="Enter delivery address"
                value={state.withinCity.dropoffLocation}
                onChange={(e) => dispatch({
                  type: 'SET_WITHIN_CITY_FIELD',
                  field: 'dropoffLocation',
                  value: e.target.value
                })}
                fullWidth
              />

              <DateTimePicker
                type="datetime"
                label="Preferred Pickup Date & Time"
                value={state.withinCity.pickupDateTime}
                onChange={(value) => dispatch({
                  type: 'SET_WITHIN_CITY_FIELD',
                  field: 'pickupDateTime',
                  value
                })}
                disablePast
              />
            </Stack>
          )}

          {/* Inter-City Form */}
          {state.selectedMethod === 'inter-city' && (
            <Stack spacing={3}>
              <Typography variant="h6">Package Details</Typography>

              <TextInput
                label="Sender City"
                placeholder="Enter sender city"
                value={state.interCity.senderCity}
                onChange={(e) => dispatch({
                  type: 'SET_INTER_CITY_FIELD',
                  field: 'senderCity',
                  value: e.target.value
                })}
                fullWidth
              />

              <TextInput
                label="Sender Address"
                placeholder="Enter sender address"
                value={state.interCity.senderAddress}
                onChange={(e) => dispatch({
                  type: 'SET_INTER_CITY_FIELD',
                  field: 'senderAddress',
                  value: e.target.value
                })}
                fullWidth
              />

              <TextInput
                label="Delivery City"
                placeholder="Enter delivery city"
                value={state.interCity.deliveryCity}
                onChange={(e) => dispatch({
                  type: 'SET_INTER_CITY_FIELD',
                  field: 'deliveryCity',
                  value: e.target.value
                })}
                fullWidth
              />

              <TextInput
                label="Delivery Address"
                placeholder="Enter delivery address"
                value={state.interCity.deliveryAddress}
                onChange={(e) => dispatch({
                  type: 'SET_INTER_CITY_FIELD',
                  field: 'deliveryAddress',
                  value: e.target.value
                })}
                fullWidth
              />

              <DateTimePicker
                type="datetime"
                label="Preferred Delivery Date & Time"
                value={state.interCity.preferredDeliveryDate}
                onChange={(value) => dispatch({
                  type: 'SET_INTER_CITY_FIELD',
                  field: 'preferredDeliveryDate',
                  value
                })}
                disablePast
              />
            </Stack>
          )}

          {/* International Form */}
          {state.selectedMethod === 'international' && (
            <Stack spacing={3}>
              <Typography variant="h6">Package Details</Typography>

              <Select
                label="Pickup Country"
                options={countries}
                value={state.international.pickupCountry}
                onChange={(value) => dispatch({
                  type: 'SET_INTERNATIONAL_FIELD',
                  field: 'pickupCountry',
                  value
                })}
                placeholder="Select pickup country"
              />

              <TextInput
                label="Pickup City"
                placeholder="Enter pickup city"
                value={state.international.pickupCity}
                onChange={(e) => dispatch({
                  type: 'SET_INTERNATIONAL_FIELD',
                  field: 'pickupCity',
                  value: e.target.value
                })}
                fullWidth
              />

              <TextInput
                label="Pickup Address"
                placeholder="Enter pickup address"
                value={state.international.pickupAddress}
                onChange={(e) => dispatch({
                  type: 'SET_INTERNATIONAL_FIELD',
                  field: 'pickupAddress',
                  value: e.target.value
                })}
                fullWidth
              />

              <Select
                label="Destination Country"
                options={countries}
                value={state.international.destinationCountry}
                onChange={(value) => dispatch({
                  type: 'SET_INTERNATIONAL_FIELD',
                  field: 'destinationCountry',
                  value
                })}
                placeholder="Select destination country"
              />

              <TextInput
                label="Destination City"
                placeholder="Enter destination city"
                value={state.international.destinationCity}
                onChange={(e) => dispatch({
                  type: 'SET_INTERNATIONAL_FIELD',
                  field: 'destinationCity',
                  value: e.target.value
                })}
                fullWidth
              />

              <TextInput
                label="Destination Address"
                placeholder="Enter destination address"
                value={state.international.destinationAddress}
                onChange={(e) => dispatch({
                  type: 'SET_INTERNATIONAL_FIELD',
                  field: 'destinationAddress',
                  value: e.target.value
                })}
                fullWidth
              />

              <DateTimePicker
                type="datetime"
                label="Preferred Delivery Date & Time"
                value={state.international.deliveryDate}
                onChange={(value) => dispatch({
                  type: 'SET_INTERNATIONAL_FIELD',
                  field: 'deliveryDate',
                  value
                })}
                disablePast
              />
            </Stack>
          )}

          {/* Footer */}
          <Box sx={{ mt: 4 }}>
            {canRequestPicker ? (
              <Button
                onClick={handleRequestPicker}
                disabled={isSearchingPickers}
                loading={isSearchingPickers}
                fullWidth
                size="large"
              >
                {isSearchingPickers ? 'Searching...' : 'Request Picker'}
              </Button>
            ) : state.selectedMethod ? (
              <Box
                sx={{
                  p: 2,
                  textAlign: 'center',
                  color: '#666666',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="body2">
                  {state.selectedMethod === 'within-city'
                    ? 'Fill all fields to request picker'
                    : state.selectedMethod === 'inter-city'
                    ? 'Fill all fields to continue'
                    : state.selectedMethod === 'international'
                    ? 'Fill all fields to continue'
                    : 'This delivery type is coming soon'
                  }
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  p: 2,
                  textAlign: 'center',
                  color: '#666666',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="body2">
                  Choose a delivery type to continue
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Loading screen overlay */}
        {isSearchingPickers && (
          <PickerSearchLoader onSearchComplete={handleSearchComplete} />
        )}
      </MobileContainer>
    </Box>
  );
}