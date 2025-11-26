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
import { getMyDeliveryRequests, getIncomingDeliveries } from '../api/delivery';
import { useNavigationBadges } from '../../hooks/useNavigationBadges';
import dynamic from 'next/dynamic';
import { DeliveryRequest } from '../api/delivery';

const DualLocationPicker = dynamic(() => import('@/components/DualLocationPicker'), {
  ssr: false,
  loading: () => <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
});

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  country?: string;
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

interface IncomingDeliveriesTabProps {
  deliveries: DeliveryRequest[];
  loading: boolean;
  onRefresh: () => void;
}

function MyDeliveriesTab({ deliveries, loading, onRefresh }: MyDeliveriesTabProps) {
  const router = useRouter();
  const [subTab, setSubTab] = useState<'current' | 'past'>('current');

  // Sort deliveries by newest first
  const sortedDeliveries = [...deliveries].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Group deliveries for sub-tabs
  const currentDeliveries = sortedDeliveries.filter(d =>
    ['pending', 'accepted', 'picked_up'].includes(d.status)
  );
  const pastDeliveries = sortedDeliveries.filter(d =>
    ['delivered', 'cancelled'].includes(d.status)
  );

  // Helper to shorten address
  const shortenAddress = (address: string) => {
    if (!address) return 'N/A';
    // Remove postal code and country, keep only street and city
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}`;
    }
    return parts[0] || address;
  };

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

  const displayDeliveries = subTab === 'current' ? currentDeliveries : pastDeliveries;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Sub-tabs */}
      <Tabs
        value={subTab}
        onChange={(_, newValue) => setSubTab(newValue)}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
          minHeight: 40,
          '& .MuiTab-root': {
            minHeight: 40,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
          },
        }}
      >
        <Tab label={`Current (${currentDeliveries.length})`} value="current" />
        <Tab label={`Past (${pastDeliveries.length})`} value="past" />
      </Tabs>

      {/* Delivery Cards */}
      {displayDeliveries.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            {subTab === 'current' ? 'No current deliveries' : 'No past deliveries'}
          </Typography>
        </Box>
      ) : (
        displayDeliveries.map(delivery => (
          <Card
            key={delivery.id}
            sx={{
              mb: 2,
              p: 2,
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {delivery.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {new Date(delivery.createdAt).toLocaleDateString('en-US')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {delivery.deliveryType === 'inter-city' && (
                  <Chip
                    label="Inter-City"
                    size="small"
                    color="info"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                <Chip
                  label={delivery.status.replace('_', ' ')}
                  size="small"
                  color={
                    delivery.status === 'delivered' ? 'success' :
                    delivery.status === 'cancelled' ? 'error' :
                    delivery.status === 'pending' ? 'warning' : 'primary'
                  }
                  sx={{ height: 20, fontSize: '0.7rem', textTransform: 'capitalize' }}
                />
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {shortenAddress(delivery.fromLocation?.address || '')} →{' '}
              {shortenAddress(delivery.toLocation?.address || '')}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {delivery.price} zł
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {delivery.size}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                onClick={() => router.push(`/delivery-methods/${delivery.id}/offers`)}
              >
                View Offers
              </Button>
              <Button
                size="small"
                variant="contained"
                fullWidth
                onClick={() => {
                  // Save delivery data for search pickers flow
                  localStorage.setItem('searchPickersDeliveryId', delivery.id.toString());
                  localStorage.setItem('deliveryData', JSON.stringify({
                    deliveryId: delivery.id,
                    fromLocation: delivery.fromLocation,
                    toLocation: delivery.toLocation,
                    deliveryType: delivery.deliveryType || 'within-city',
                  }));
                  router.push('/picker-results');
                }}
              >
                Search Pickers
              </Button>
            </Stack>
          </Card>
        ))
      )}
    </Box>
  );
}

function IncomingDeliveriesTab({ deliveries, loading, onRefresh }: IncomingDeliveriesTabProps) {
  const router = useRouter();

  const pendingDeliveries = deliveries.filter(d => d.status === 'pending' && !d.recipientConfirmed);
  const acceptedDeliveries = deliveries.filter(d => d.recipientConfirmed === true && d.status !== 'delivered');
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');

  const handleConfirm = async (id: number, confirmed: boolean) => {
    try {
      const { confirmRecipient } = await import('../api/delivery');
      await confirmRecipient(id, confirmed);
      alert(confirmed ? 'Delivery accepted!' : 'Delivery rejected');
      onRefresh();
    } catch (err) {
      console.error('Failed to confirm delivery:', err);
      alert('Failed to process confirmation');
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
      {/* Pending Confirmation Section */}
      {pendingDeliveries.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Pending Confirmation ({pendingDeliveries.length})
          </Typography>
          {pendingDeliveries.map(delivery => (
            <Card key={delivery.id} sx={{ mb: 2, p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {delivery.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {delivery.fromLocation?.address || 'N/A'} → {delivery.toLocation?.address || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Size: {delivery.size} | Price: {delivery.price} zł
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => handleConfirm(delivery.id, true)}
                >
                  Accept
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleConfirm(delivery.id, false)}
                >
                  Reject
                </Button>
              </Stack>
            </Card>
          ))}
        </Box>
      )}

      {/* Accepted Section */}
      {acceptedDeliveries.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Active ({acceptedDeliveries.length})
          </Typography>
          {acceptedDeliveries.map(delivery => (
            <Card key={delivery.id} sx={{ mb: 2, p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {delivery.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {delivery.fromLocation?.address || 'N/A'} → {delivery.toLocation?.address || 'N/A'}
              </Typography>
              <Chip
                label={delivery.status === 'picked_up' ? 'In Transit' : delivery.status}
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
            Delivered ({completedDeliveries.length})
          </Typography>
          {completedDeliveries.map(delivery => (
            <Card key={delivery.id} sx={{ mb: 2, p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {delivery.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {delivery.fromLocation?.address || 'N/A'} → {delivery.toLocation?.address || 'N/A'}
              </Typography>
              <Chip
                label="Delivered"
                size="small"
                color="success"
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
            No incoming deliveries
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
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'incoming'>('create');
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [incomingDeliveries, setIncomingDeliveries] = useState<DeliveryRequest[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [loadingIncoming, setLoadingIncoming] = useState(false);

  // Get navigation badge counts
  const { unreadChats, unreadNotifications, activeOrders } = useNavigationBadges();

  // Handle query params for tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'manage') {
      setActiveTab('manage');
    } else if (tab === 'incoming') {
      setActiveTab('incoming');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'manage') {
      loadDeliveries();
    } else if (activeTab === 'incoming') {
      loadIncomingDeliveries();
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

  const loadIncomingDeliveries = async () => {
    setLoadingIncoming(true);
    try {
      const response = await getIncomingDeliveries();
      setIncomingDeliveries(response.data);
    } catch (err) {
      console.error('Failed to load incoming deliveries:', err);
    } finally {
      setLoadingIncoming(false);
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

  const isWithinCityFilled = state.withinCity.fromLocation && state.withinCity.toLocation;
  const isInterCityFilled = state.interCity.fromLocation && state.interCity.toLocation;
  const isInternationalFilled = state.interCity.fromLocation && state.interCity.toLocation && state.selectedMethod === 'international';

  const canRequestPicker = (() => {
    const { selectedMethod, withinCity, interCity } = state;

    switch (selectedMethod) {
      case 'within-city':
        return withinCity.fromLocation && withinCity.toLocation && withinCity.pickupDateTime;
      case 'inter-city':
      case 'international':
        return interCity.fromLocation && interCity.toLocation && interCity.preferredDeliveryDate;
      default:
        return false;
    }
  })();

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
    dispatch({ type: 'SET_INTER_CITY_FIELD', field: 'fromLocation', value: null });
    dispatch({ type: 'SET_INTER_CITY_FIELD', field: 'toLocation', value: null });
    dispatch({ type: 'SET_INTER_CITY_FIELD', field: 'preferredDeliveryDate', value: null });
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
        case 'international':
          fromLocation = state.interCity.fromLocation;
          toLocation = state.interCity.toLocation;
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
              <Tab value="create" label="Create" />
              <Tab value="manage" label="Sent" />
              <Tab value="incoming" label="Incoming" />
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

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Select pickup and delivery locations (worldwide)
                  </Typography>
                  <DualLocationPicker
                    deliveryType="international"
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

        {/* Tab Content: Incoming */}
        {activeTab === 'incoming' && (
          <IncomingDeliveriesTab
            deliveries={incomingDeliveries}
            loading={loadingIncoming}
            onRefresh={loadIncomingDeliveries}
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