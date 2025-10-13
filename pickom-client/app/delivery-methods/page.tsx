'use client';

import { useReducer, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Stack, Tabs, Tab, Card, Chip, CircularProgress } from '@mui/material';
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

interface DeliveryRequest {
  id: number;
  senderId: string;
  pickerId?: string;
  title: string;
  description?: string;
  fromAddress: string;
  fromCity?: string;
  toAddress: string;
  toCity?: string;
  deliveryType?: 'within-city' | 'inter-city';
  price: number;
  size: 'small' | 'medium' | 'large';
  weight?: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: string;
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
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_PRICE'; payload: number }
  | { type: 'SET_SIZE'; payload: 'small' | 'medium' | 'large' | '' }
  | { type: 'SET_WEIGHT'; payload: number }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'SET_WITHIN_CITY_FIELD'; field: keyof DeliveryFormState['withinCity']; value: string | Date | null }
  | { type: 'SET_INTER_CITY_FIELD'; field: keyof DeliveryFormState['interCity']; value: string | Date | null }
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
                {delivery.fromAddress} → {delivery.toAddress}
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
                      fromAddress: delivery.fromAddress,
                      toAddress: delivery.toAddress,
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
                {delivery.fromAddress} → {delivery.toAddress}
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
                {delivery.fromAddress} → {delivery.toAddress}
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
                {delivery.fromAddress} → {delivery.toAddress}
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

  const handleNext = () => {
    if (canRequestPicker) {
      // Prepare delivery data
      let fromAddress = '';
      let toAddress = '';

      // Set addresses based on method
      switch (state.selectedMethod) {
        case 'within-city':
          fromAddress = state.withinCity.pickupLocation;
          toAddress = state.withinCity.dropoffLocation;
          break;
        case 'inter-city':
          fromAddress = `${state.interCity.senderAddress}, ${state.interCity.senderCity}`;
          toAddress = `${state.interCity.deliveryAddress}, ${state.interCity.deliveryCity}`;
          break;
        case 'international':
          fromAddress = `${state.international.pickupAddress}, ${state.international.pickupCity}, ${state.international.pickupCountry}`;
          toAddress = `${state.international.destinationAddress}, ${state.international.destinationCity}, ${state.international.destinationCountry}`;
          break;
      }

      // Save delivery method data to localStorage for next step
      const deliveryMethodData = {
        selectedMethod: state.selectedMethod,
        fromAddress,
        toAddress,
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
                {deliveryMethods.map((method) => (
                  <Button
                    key={method.id}
                    selected={state.selectedMethod === method.id}
                    onClick={() => dispatch({ type: 'SET_METHOD', payload: method.id })}
                    size="small"
                    sx={{
                      flex: 1,
                      flexDirection: 'column',
                      py: 1.5,
                      minWidth: 0,
                      px: 0.5,
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