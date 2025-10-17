'use client';

import { useReducer, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Stack, Tabs, Tab, Card, Chip, CircularProgress, Badge, IconButton, Tooltip } from '@mui/material';
import { CheckCircle, Clear as ClearIcon } from '@mui/icons-material';
import {
  Button,
  TextInput,
  Select,
  DateTimePicker,
  MobileContainer,
  PickomLogo
} from '../../components/ui';
import { DeliveryMethodType } from '../../types/delivery';
import BottomNavigation from '../../components/common/BottomNavigation';
import { getMyDeliveryRequests } from '../api/delivery';
import { useNavigationBadges } from '../../hooks/useNavigationBadges';
import dynamic from 'next/dynamic';

// Dynamically import DualLocationPicker to avoid SSR issues with Leaflet
const DualLocationPicker = dynamic(() => import('@/components/DualLocationPicker'), {
  ssr: false,
  loading: () => <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
});

interface DeliveryRequest {
  id: number;
  senderId: string;
  pickerId?: string;
  title: string;
  description?: string;
  fromLocation: LocationData | null;
  toLocation: LocationData | null;
  deliveryType?: 'within-city' | 'inter-city';
  price: number;
  size: 'small' | 'medium' | 'large';
  weight?: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city?: string;
}

interface DeliveryFormState {
  selectedMethod: DeliveryMethodType | '';
  title: string;
  description: string;
  price: number;
  size: 'small' | 'medium' | 'large' | '';
  weight: number;
  notes: string;
  withinCity: {
    fromLocation: LocationData | null;
    toLocation: LocationData | null;
    pickupDateTime: Date | null;
  };
  interCity: {
    fromLocation: LocationData | null;
    toLocation: LocationData | null;
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
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_PRICE'; payload: number }
  | { type: 'SET_SIZE'; payload: 'small' | 'medium' | 'large' | '' }
  | { type: 'SET_WEIGHT'; payload: number }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'SET_WITHIN_CITY_FIELD'; field: keyof DeliveryFormState['withinCity']; value: LocationData | Date | null }
  | { type: 'SET_INTER_CITY_FIELD'; field: keyof DeliveryFormState['interCity']; value: LocationData | Date | null }
  | { type: 'SET_INTERNATIONAL_FIELD'; field: keyof DeliveryFormState['international']; value: string | Date | null | number }
  | { type: 'RESET' };

const initialState: DeliveryFormState = {
  selectedMethod: '',
  title: '',
  description: '',
  price: 0,
  size: '',
  weight: 0,
  notes: '',
  withinCity: {
    fromLocation: null,
    toLocation: null,
    pickupDateTime: null,
  },
  interCity: {
    fromLocation: null,
    toLocation: null,
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
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_PRICE':
      return { ...state, price: action.payload };
    case 'SET_SIZE':
      return { ...state, size: action.payload };
    case 'SET_WEIGHT':
      return { ...state, weight: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
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

interface MyDeliveriesTabProps {
  deliveries: DeliveryRequest[];
  loading: boolean;
  onRefresh: () => void;
}

function MyDeliveriesTab({ deliveries, loading, onRefresh }: MyDeliveriesTabProps) {
  const router = useRouter();

  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');
  const activeDeliveries = deliveries.filter(d => ['accepted', 'picked_up'].includes(d.status));
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
  const cancelledDeliveries = deliveries.filter(d => d.status === 'cancelled');

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this delivery?')) return;

    try {
      // Sender uses PATCH endpoint to update delivery status
      const { updateDeliveryRequest } = await import('../api/delivery');
      await updateDeliveryRequest(id, { status: 'cancelled' });
      alert('Delivery cancelled successfully');
      onRefresh();
    } catch (err) {
      console.error('Failed to cancel delivery:', err);
      alert('Failed to cancel delivery');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Pending Section */}
      {pendingDeliveries.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Pending ({pendingDeliveries.length})
          </Typography>
          {pendingDeliveries.map(delivery => (
            <Card key={delivery.id} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
                  {delivery.title}
                </Typography>
                {delivery.deliveryType === 'inter-city' && (
                  <Chip
                    label="Inter-City"
                    size="small"
                    color="info"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {delivery.fromLocation?.address || 'N/A'} → {delivery.toLocation?.address || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Price: {delivery.price} zł | Size: {delivery.size}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => router.push(`/orders/${delivery.id}/offers`)}
                >
                  View Offers
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    // Save delivery ID to localStorage for picker selection
                    const deliveryData = {
                      deliveryId: delivery.id,
                      fromLocation: delivery.fromLocation,
                      toLocation: delivery.toLocation,
                    };
                    localStorage.setItem('deliveryData', JSON.stringify(deliveryData));
                    router.push('/picker-results');
                  }}
                >
                  Find Picker
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => handleCancel(delivery.id)}
                >
                  Cancel
                </Button>
              </Stack>
            </Card>
          ))}
        </Box>
      )}

      {/* Active Section */}
      {activeDeliveries.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Active ({activeDeliveries.length})
          </Typography>
          {activeDeliveries.map(delivery => (
            <Card key={delivery.id} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
                  {delivery.title}
                </Typography>
                {delivery.deliveryType === 'inter-city' && (
                  <Chip
                    label="Inter-City"
                    size="small"
                    color="info"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {delivery.fromLocation?.address || 'N/A'} → {delivery.toLocation?.address || 'N/A'}
              </Typography>
              <Chip
                label={delivery.status}
                size="small"
                color="primary"
                sx={{ mt: 1 }}
              />
            </Card>
          ))}
        </Box>
      )}

      {/* Completed Section */}
      {completedDeliveries.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Completed ({completedDeliveries.length})
          </Typography>
          {completedDeliveries.map(delivery => (
            <Card key={delivery.id} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
                  {delivery.title}
                </Typography>
                {delivery.deliveryType === 'inter-city' && (
                  <Chip
                    label="Inter-City"
                    size="small"
                    color="info"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {delivery.fromLocation?.address || 'N/A'} → {delivery.toLocation?.address || 'N/A'}
              </Typography>
              <Chip
                label="Completed"
                size="small"
                color="success"
                sx={{ mt: 1 }}
              />
            </Card>
          ))}
        </Box>
      )}

      {/* Cancelled Section */}
      {cancelledDeliveries.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Cancelled ({cancelledDeliveries.length})
          </Typography>
          {cancelledDeliveries.map(delivery => (
            <Card key={delivery.id} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
                  {delivery.title}
                </Typography>
                {delivery.deliveryType === 'inter-city' && (
                  <Chip
                    label="Inter-City"
                    size="small"
                    color="info"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {delivery.fromLocation?.address || 'N/A'} → {delivery.toLocation?.address || 'N/A'}
              </Typography>
              <Chip
                label="Cancelled"
                size="small"
                color="error"
                sx={{ mt: 1 }}
              />
            </Card>
          ))}
        </Box>
      )}

      {/* Empty State */}
      {deliveries.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No deliveries yet. Create your first delivery!
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default function SendPackagePage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(deliveryFormReducer, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  // Get navigation badge counts
  const { unreadChats, unreadNotifications, activeOrders } = useNavigationBadges();

  // Handle query params for tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'manage') {
      setActiveTab('manage');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'manage') {
      loadDeliveries();
    }
  }, [activeTab]);

  const loadDeliveries = async () => {
    setLoadingDeliveries(true);
    try {
      const response = await getMyDeliveryRequests();
      setDeliveries(response.data);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoadingDeliveries(false);
    }
  };

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

  // Check if each tab is filled
  const isWithinCityFilled = state.withinCity.fromLocation && state.withinCity.toLocation;
  const isInterCityFilled = state.interCity.fromLocation && state.interCity.toLocation;
  const isInternationalFilled = state.international.pickupCountry && state.international.pickupCity;

  const canRequestPicker = (() => {
    const { selectedMethod, withinCity, interCity, international } = state;

    switch (selectedMethod) {
      case 'within-city':
        return withinCity.fromLocation && withinCity.toLocation && withinCity.pickupDateTime;
      case 'inter-city':
        return interCity.fromLocation && interCity.toLocation && interCity.preferredDeliveryDate;
      case 'international':
        return international.pickupCountry && international.pickupCity && international.pickupAddress &&
               international.destinationCountry && international.destinationCity &&
               international.destinationAddress && international.deliveryDate;
      default:
        return false;
    }
  })();

  // Clear functions for each tab
  const clearWithinCity = () => {
    dispatch({ type: 'SET_WITHIN_CITY_FIELD', field: 'fromLocation', value: null });
    dispatch({ type: 'SET_WITHIN_CITY_FIELD', field: 'toLocation', value: null });
    dispatch({ type: 'SET_WITHIN_CITY_FIELD', field: 'pickupDateTime', value: null });
  };

  const clearInterCity = () => {
    dispatch({ type: 'SET_INTER_CITY_FIELD', field: 'fromLocation', value: null });
    dispatch({ type: 'SET_INTER_CITY_FIELD', field: 'toLocation', value: null });
    dispatch({ type: 'SET_INTER_CITY_FIELD', field: 'preferredDeliveryDate', value: null });
  };

  const clearInternational = () => {
    dispatch({ type: 'SET_INTERNATIONAL_FIELD', field: 'pickupCountry', value: '' });
    dispatch({ type: 'SET_INTERNATIONAL_FIELD', field: 'pickupCity', value: '' });
    dispatch({ type: 'SET_INTERNATIONAL_FIELD', field: 'pickupAddress', value: '' });
    dispatch({ type: 'SET_INTERNATIONAL_FIELD', field: 'destinationCountry', value: '' });
    dispatch({ type: 'SET_INTERNATIONAL_FIELD', field: 'destinationCity', value: '' });
    dispatch({ type: 'SET_INTERNATIONAL_FIELD', field: 'destinationAddress', value: '' });
    dispatch({ type: 'SET_INTERNATIONAL_FIELD', field: 'deliveryDate', value: null });
  };

  const handleNext = () => {
    if (canRequestPicker) {
      // Prepare delivery data with location objects
      let fromLocation: LocationData | null = null;
      let toLocation: LocationData | null = null;

      // Set locations based on method
      switch (state.selectedMethod) {
        case 'within-city':
          fromLocation = state.withinCity.fromLocation;
          toLocation = state.withinCity.toLocation;
          break;
        case 'inter-city':
          fromLocation = state.interCity.fromLocation;
          toLocation = state.interCity.toLocation;
          break;
        case 'international':
          fromLocation = {
            lat: 0,
            lng: 0,
            address: `${state.international.pickupAddress}, ${state.international.pickupCity}, ${state.international.pickupCountry}`,
            city: state.international.pickupCity
          };
          toLocation = {
            lat: 0,
            lng: 0,
            address: `${state.international.destinationAddress}, ${state.international.destinationCity}, ${state.international.destinationCountry}`,
            city: state.international.destinationCity
          };
          break;
      }

      // Save delivery method data to localStorage for next step
      const deliveryMethodData = {
        selectedMethod: state.selectedMethod,
        fromLocation,
        toLocation,
      };

      localStorage.setItem('deliveryData', JSON.stringify(deliveryMethodData));

      // Redirect to package-type page
      router.push('/package-type');
    }
  };

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
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Delivery Management
              </Typography>
            </Box>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="fullWidth"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab value="create" label="Create New" />
              <Tab value="manage" label="My Deliveries" />
            </Tabs>

            {/* Tab Content: Create */}
            {activeTab === 'create' && (
              <Box>
            {/* Delivery Method Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Choose Delivery Method
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                {deliveryMethods.map((method) => {
                  const isFilled =
                    (method.id === 'within-city' && isWithinCityFilled) ||
                    (method.id === 'inter-city' && isInterCityFilled) ||
                    (method.id === 'international' && isInternationalFilled);

                  return (
                    <Badge
                      key={method.id}
                      badgeContent={isFilled ? <CheckCircle sx={{ fontSize: 16 }} /> : null}
                      color="success"
                      overlap="circular"
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      <Button
                        selected={state.selectedMethod === method.id}
                        onClick={() => dispatch({ type: 'SET_METHOD', payload: method.id })}
                        size="small"
                        sx={{
                          flex: 1,
                          flexDirection: 'column',
                          py: 1.5,
                          minWidth: 0,
                          px: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            lineHeight: 1.2,
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {method.name}
                        </Typography>
                      </Button>
                    </Badge>
                  );
                })}
              </Stack>
            </Box>

            {/* Within-City Form */}
            {state.selectedMethod === 'within-city' && (
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Package Details</Typography>
                  {isWithinCityFilled && (
                    <Tooltip title="Clear all fields">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={clearWithinCity}
                        sx={{ ml: 1 }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Select pickup and delivery locations
                  </Typography>
                  <DualLocationPicker
                    deliveryType="within-city"
                    onFromLocationSelect={(location) => dispatch({
                      type: 'SET_WITHIN_CITY_FIELD',
                      field: 'fromLocation',
                      value: location
                    })}
                    onToLocationSelect={(location) => dispatch({
                      type: 'SET_WITHIN_CITY_FIELD',
                      field: 'toLocation',
                      value: location
                    })}
                    initialFromLocation={state.withinCity.fromLocation || undefined}
                    initialToLocation={state.withinCity.toLocation || undefined}
                  />
                </Box>

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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Package Details</Typography>
                  {isInterCityFilled && (
                    <Tooltip title="Clear all fields">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={clearInterCity}
                        sx={{ ml: 1 }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Select sender and delivery locations
                  </Typography>
                  <DualLocationPicker
                    deliveryType="inter-city"
                    onFromLocationSelect={(location) => dispatch({
                      type: 'SET_INTER_CITY_FIELD',
                      field: 'fromLocation',
                      value: location
                    })}
                    onToLocationSelect={(location) => dispatch({
                      type: 'SET_INTER_CITY_FIELD',
                      field: 'toLocation',
                      value: location
                    })}
                    initialFromLocation={state.interCity.fromLocation || undefined}
                    initialToLocation={state.interCity.toLocation || undefined}
                  />
                </Box>

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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Package Details</Typography>
                  {isInternationalFilled && (
                    <Tooltip title="Clear all fields">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={clearInternational}
                        sx={{ ml: 1 }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

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
                  onClick={handleNext}
                  fullWidth
                  size="large"
                >
                  Next: Package Details
                </Button>
              ) : state.selectedMethod ? (
                <Box
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    color: 'text.secondary',
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
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
                    color: 'text.secondary',
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2">
                    Choose a delivery type to continue
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Tab Content: Manage */}
        {activeTab === 'manage' && (
          <MyDeliveriesTab
            deliveries={deliveries}
            loading={loadingDeliveries}
            onRefresh={loadDeliveries}
          />
        )}
          </Box>
        </MobileContainer>
        <BottomNavigation
          unreadChatsCount={unreadChats}
          unreadNotificationsCount={unreadNotifications}
          activeOrdersCount={activeOrders}
        />
      </Box>
    </Box>
  );
}