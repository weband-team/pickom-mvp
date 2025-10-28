'use client';

import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress, Alert, Chip, Accordion, AccordionSummary, AccordionDetails, TextField, Button as MuiButton, SwipeableDrawer, IconButton } from '@mui/material';
import { LocalShipping, ExpandMore, AddCircleOutline, DirectionsCar, LocationCity, PersonSearch, Mail, Close } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { getMyDeliveryRequests, getDeliveryRequestById } from '../api/delivery';
import { getCurrentUser, updateOnlineStatus } from '../api/user';
import { notificationsAPI, type Notification } from '../api/notifications';
import MyPickerCard from '@/components/picker/MyPickerCard';
import PickerCardModal from '@/components/picker/PickerCardModal';
import EditPickerCardModal from '@/components/picker/EditPickerCardModal';
import { getPickerSettings, savePickerSettings, toggleOnlineStatus, type PickerCardSettings } from '@/data/mockPickerSettings';
import type { Picker } from '@/types/picker';
import { useNavigationBadges } from '@/hooks/useNavigationBadges';

interface DeliveryRequest {
  id: number;
  senderId: string;
  fromAddress: string;
  toAddress: string;
  price: number;
  deliveryType?: 'within-city' | 'inter-city';
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface PlannedTrip {
  id: string;
  fromCity: string;
  toCity: string;
  departureDateTime: string;
  arrivalDateTime: string;
  createdAt: string;
}

export default function AvailableDeliveriesPage() {
  const router = useRouter();
  const { unreadChats, unreadNotifications } = useNavigationBadges();
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'available' | 'active' | 'history' | 'invitations'>('available');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [invitations, setInvitations] = useState<DeliveryRequest[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  const [plannedTrips, setPlannedTrips] = useState<PlannedTrip[]>(() => {
    // Load planned trips from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pickerPlannedTrips');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [tripForm, setTripForm] = useState({
    fromCity: '',
    toCity: '',
    departureDateTime: '',
    arrivalDateTime: '',
  });

  // Picker Card state
  const [pickerSettings, setPickerSettings] = useState<PickerCardSettings>(() => getPickerSettings());
  const [showViewCardModal, setShowViewCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);

  // Offer state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRequest | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerMessage, setOfferMessage] = useState<string>('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Mock picker data - in real app this would come from user profile
  const currentPicker: Picker = {
    id: 'current-user',
    fullName: 'John Doe',
    email: 'john@example.com',
    avatarUrl: '',
    rating: 4.7,
    isVerified: true,
    isOnline: pickerSettings.isOnline,
    isPhoneVerified: true,
    isEmailVerified: true,
    price: pickerSettings.price,
    duration: 30,
    trustLevel: 85,
    reviewCount: 42,
    distance: 0,
    vehicle: pickerSettings.vehicle,
    completedDeliveries: 127,
    deliveryCount: 127,
    description: pickerSettings.bio,
  };

  // Load current user UID on mount and sync online status
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const { user } = await getCurrentUser();
        setCurrentUserId(user.uid);

        // Sync local online status with backend on mount
        const localOnlineStatus = pickerSettings.isOnline;
        if (user.isOnline !== localOnlineStatus) {
          console.log(`Syncing online status: local=${localOnlineStatus}, backend=${user.isOnline}`);
          await updateOnlineStatus(user.uid, localOnlineStatus);
        }
      } catch (err) {
        console.error('Failed to load current user:', err);
      }
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getMyDeliveryRequests();
        setDeliveries(response.data);
      } catch (err: any) {
        console.error('Failed to fetch deliveries:', err);
        setError('Failed to load delivery requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Load invitations when tab is switched to invitations
  useEffect(() => {
    if (selectedTab === 'invitations') {
      loadInvitations();
    }
  }, [selectedTab]);

  const loadInvitations = async () => {
    setLoadingInvitations(true);
    try {
      // Get all notifications of type 'new_delivery'
      const notifications = await notificationsAPI.getUserNotifications();
      console.log('All notifications:', notifications);

      const invitationNotifications = notifications.filter(
        (n: Notification) => n.type === 'new_delivery' && n.related_delivery_id
      );
      console.log('Invitation notifications:', invitationNotifications);

      // Fetch delivery details for each invitation
      const invitationDeliveries = await Promise.all(
        invitationNotifications.map(async (notification: Notification) => {
          try {
            console.log('Fetching delivery:', notification.related_delivery_id);
            const response = await getDeliveryRequestById(notification.related_delivery_id!);
            console.log('Delivery data:', response.data);
            return response.data;
          } catch (err) {
            console.error('Failed to fetch delivery:', notification.related_delivery_id, err);
            return null;
          }
        })
      );

      // Filter out null values and only show pending deliveries
      const filtered = invitationDeliveries.filter(
        (d): d is DeliveryRequest => d !== null && d.status === 'pending'
      );
      console.log('Filtered invitations:', filtered);

      setInvitations(filtered);
    } catch (err) {
      console.error('Failed to load invitations:', err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const availableDeliveries = useMemo(() => {
    return deliveries.filter(d => d.status === 'pending');
  }, [deliveries]);

  const activeDeliveries = useMemo(() => {
    return deliveries.filter(d => d.status === 'accepted' || d.status === 'picked_up');
  }, [deliveries]);

  const historyDeliveries = useMemo(() => {
    return deliveries.filter(d => d.status === 'delivered' || d.status === 'cancelled');
  }, [deliveries]);

  const displayedDeliveries = useMemo(() => {
    switch (selectedTab) {
      case 'available':
        return availableDeliveries;
      case 'active':
        return activeDeliveries;
      case 'history':
        return historyDeliveries;
      case 'invitations':
        return invitations;
      default:
        return availableDeliveries;
    }
  }, [selectedTab, availableDeliveries, activeDeliveries, historyDeliveries, invitations]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'available' | 'active' | 'history' | 'invitations') => {
    setSelectedTab(newValue);
  };

  const handleDeliveryClick = (deliveryId: number) => {
    router.push(`/delivery-details/${deliveryId}`);
  };

  const handleMakeOffer = (delivery: DeliveryRequest) => {
    setSelectedDelivery(delivery);
    setOfferPrice(Number(delivery.price) || 0);
    setOfferMessage('');
    setShowOfferModal(true);
  };

  const handleSubmitOffer = async () => {
    if (!selectedDelivery || offerPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setSubmittingOffer(true);
    try {
      const { createOffer } = await import('../api/offers');
      await createOffer({
        deliveryId: selectedDelivery.id,
        price: offerPrice,
        message: offerMessage || undefined,
      });

      alert('Offer submitted successfully!');
      setShowOfferModal(false);
      setSelectedDelivery(null);
    } catch (err: any) {
      console.error('Failed to create offer:', err);
      alert(err.response?.data?.message || 'Failed to create offer. Please try again.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Picker Card handlers
  const handlePickerOnlineToggle = async () => {
    const newOnlineStatus = toggleOnlineStatus();
    setPickerSettings(getPickerSettings());

    // Sync with backend
    if (currentUserId) {
      try {
        await updateOnlineStatus(currentUserId, newOnlineStatus);
        console.log('Online status synced with backend:', newOnlineStatus);
      } catch (err) {
        console.error('Failed to sync online status with backend:', err);
        // Optionally show error toast to user
      }
    }
  };

  const handleViewCard = () => {
    setShowViewCardModal(true);
  };

  const handleEditCard = () => {
    setShowEditCardModal(true);
  };

  const handleSaveSettings = (newSettings: PickerCardSettings) => {
    setPickerSettings(newSettings);
    setShowEditCardModal(false);
  };

  const handleTripFormChange = (field: keyof typeof tripForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTripForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddTrip = () => {
    if (!tripForm.fromCity || !tripForm.toCity || !tripForm.departureDateTime || !tripForm.arrivalDateTime) {
      return;
    }

    const newTrip: PlannedTrip = {
      id: Date.now().toString(),
      fromCity: tripForm.fromCity,
      toCity: tripForm.toCity,
      departureDateTime: tripForm.departureDateTime,
      arrivalDateTime: tripForm.arrivalDateTime,
      createdAt: new Date().toISOString(),
    };

    const updatedTrips = [...plannedTrips, newTrip];
    setPlannedTrips(updatedTrips);
    localStorage.setItem('pickerPlannedTrips', JSON.stringify(updatedTrips));

    // Reset form
    setTripForm({
      fromCity: '',
      toCity: '',
      departureDateTime: '',
      arrivalDateTime: '',
    });
  };

  const handleDeleteTrip = (tripId: string) => {
    const updatedTrips = plannedTrips.filter(trip => trip.id !== tripId);
    setPlannedTrips(updatedTrips);
    localStorage.setItem('pickerPlannedTrips', JSON.stringify(updatedTrips));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'picked_up': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'picked_up': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              backgroundColor: 'background.default',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                Delivery Requests
              </Typography>
            </Box>

            {/* My Picker Card Widget */}
            <Box sx={{ px: 2, pt: 2 }}>
              <MyPickerCard
                isOnline={pickerSettings.isOnline}
                price={pickerSettings.price}
                rating={currentPicker.rating}
                onToggleOnline={handlePickerOnlineToggle}
                onViewCard={handleViewCard}
                onEdit={handleEditCard}
              />
            </Box>

            {/* Plan a Trip Section */}
            <Accordion sx={{ boxShadow: 'none', borderBottom: 1, borderColor: 'divider' }}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  backgroundColor: 'background.paper',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCar color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Plan a Trip
                  </Typography>
                  {plannedTrips.length > 0 && (
                    <Chip
                      label={plannedTrips.length}
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: '0.75rem' }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="From City"
                    value={tripForm.fromCity}
                    onChange={handleTripFormChange('fromCity')}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="To City"
                    value={tripForm.toCity}
                    onChange={handleTripFormChange('toCity')}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Departure Date & Time"
                    type="datetime-local"
                    value={tripForm.departureDateTime}
                    onChange={handleTripFormChange('departureDateTime')}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Arrival Date & Time"
                    type="datetime-local"
                    value={tripForm.arrivalDateTime}
                    onChange={handleTripFormChange('arrivalDateTime')}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <MuiButton
                    variant="contained"
                    startIcon={<AddCircleOutline />}
                    onClick={handleAddTrip}
                    disabled={!tripForm.fromCity || !tripForm.toCity || !tripForm.departureDateTime || !tripForm.arrivalDateTime}
                    sx={{ textTransform: 'none' }}
                  >
                    Add Trip
                  </MuiButton>

                  {/* Planned Trips List */}
                  {plannedTrips.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Planned Trips ({plannedTrips.length})
                      </Typography>
                      {plannedTrips.map((trip) => (
                        <Box
                          key={trip.id}
                          sx={{
                            p: 1.5,
                            mb: 1,
                            borderRadius: 1,
                            backgroundColor: 'background.default',
                            border: 1,
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {trip.fromCity} → {trip.toCity}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Depart: {new Date(trip.departureDateTime).toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Arrive: {new Date(trip.arrivalDateTime).toLocaleString('en-US')}
                              </Typography>
                            </Box>
                            <MuiButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTrip(trip.id)}
                              sx={{ textTransform: 'none', minWidth: 'auto' }}
                            >
                              Delete
                            </MuiButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Tabs */}
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                minHeight: 48,
                '& .MuiTabs-flexContainer': {
                  pl: 0,
                },
                '& .MuiTabs-scroller': {
                  ml: 0,
                },
                '& .MuiTab-root': {
                  minHeight: 48,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: 80,
                  pl: 2,
                  pr: 2,
                  '&:first-of-type': {
                    pl: 0,
                  },
                },
              }}
            >
              <Tab
                label={`Available (${availableDeliveries.length})`}
                value="available"
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Mail sx={{ fontSize: 16 }} />
                    Invitations ({invitations.length})
                  </Box>
                }
                value="invitations"
              />
              <Tab
                label={`Active (${activeDeliveries.length})`}
                value="active"
              />
              <Tab
                label={`History (${historyDeliveries.length})`}
                value="history"
              />
            </Tabs>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                pb: 8,
              }}
            >
              {(loading || (selectedTab === 'invitations' && loadingInvitations)) ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ p: 3 }}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              ) : displayedDeliveries.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', py: 8 }}>
                  {selectedTab === 'invitations' ? (
                    <Mail sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  ) : (
                    <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  )}
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {selectedTab === 'available' && 'No available deliveries'}
                    {selectedTab === 'active' && 'No active deliveries'}
                    {selectedTab === 'history' && 'No delivery history'}
                    {selectedTab === 'invitations' && 'No invitations'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTab === 'available' && 'Check back later for new delivery requests'}
                    {selectedTab === 'active' && 'Accepted deliveries will appear here'}
                    {selectedTab === 'history' && 'Your completed and cancelled deliveries will appear here'}
                    {selectedTab === 'invitations' && 'Senders will invite you to deliver their packages'}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 2 }}>
                  {displayedDeliveries.map((delivery) => (
                    <Box
                      key={delivery.id}
                      onClick={() => handleDeliveryClick(delivery.id)}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Delivery #{delivery.id}
                          </Typography>
                          {delivery.deliveryType && (
                            <Chip
                              label={delivery.deliveryType === 'within-city' ? 'Within City' : 'Inter-City'}
                              size="small"
                              color={delivery.deliveryType === 'within-city' ? 'primary' : 'warning'}
                              icon={delivery.deliveryType === 'within-city' ? <LocationCity sx={{ fontSize: 14 }} /> : <DirectionsCar sx={{ fontSize: 14 }} />}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                        <Chip
                          label={getStatusLabel(delivery.status)}
                          size="small"
                          color={getStatusColor(delivery.status) as any}
                          sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                      </Box>

                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          From
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {delivery.fromAddress}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          To
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {delivery.toAddress}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                          {Number(delivery.price || 0).toFixed(2)} zl
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(delivery.createdAt).toLocaleDateString('en-US')}
                        </Typography>
                      </Box>

                      {/* Show different buttons based on delivery status and tab */}
                      {selectedTab === 'available' && (
                        <MuiButton
                          variant="contained"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMakeOffer(delivery);
                          }}
                        >
                          Make Offer
                        </MuiButton>
                      )}
                      {selectedTab === 'invitations' && (
                        <MuiButton
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/delivery-details/${delivery.id}`);
                          }}
                        >
                          View Invitation
                        </MuiButton>
                      )}
                      {selectedTab === 'active' && (
                        <MuiButton
                          variant="contained"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/delivery-details/${delivery.id}`);
                          }}
                        >
                          View Details
                        </MuiButton>
                      )}
                      {selectedTab === 'history' && (
                        <MuiButton
                          variant="outlined"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/delivery-details/${delivery.id}`);
                          }}
                        >
                          View Details
                        </MuiButton>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </MobileContainer>
        <BottomNavigation
          unreadChatsCount={unreadChats}
          unreadNotificationsCount={unreadNotifications}
        />

        {/* Modals */}
        <PickerCardModal
          open={showViewCardModal}
          onClose={() => setShowViewCardModal(false)}
          onEdit={() => {
            setShowViewCardModal(false);
            setShowEditCardModal(true);
          }}
          picker={currentPicker}
        />

        <EditPickerCardModal
          open={showEditCardModal}
          onClose={() => setShowEditCardModal(false)}
          onSave={handleSaveSettings}
          initialSettings={pickerSettings}
        />

        {/* Offer Modal */}
        <SwipeableDrawer
          anchor="bottom"
          open={showOfferModal}
          onClose={() => !submittingOffer && setShowOfferModal(false)}
          onOpen={() => {}}
          disableSwipeToOpen
          disablePortal
          PaperProps={{
            sx: {
              maxHeight: '90vh',
              maxWidth: '375px',
              margin: '0 auto',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              backgroundColor: 'background.paper',
            },
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 3, pb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Make an Offer
            </Typography>
            <IconButton onClick={() => setShowOfferModal(false)} size="small" disabled={submittingOffer}>
              <Close />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ px: 3, pb: 3 }}>
            {selectedDelivery && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  From: {selectedDelivery.fromAddress}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  To: {selectedDelivery.toAddress}
                </Typography>

                <TextField
                  label="Your Price (zł)"
                  type="number"
                  fullWidth
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  sx={{ mb: 2 }}
                  inputProps={{ min: 0, step: 0.01 }}
                  disabled={submittingOffer}
                />

                <TextField
                  label="Message (optional)"
                  multiline
                  rows={3}
                  fullWidth
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Add a message to the sender..."
                  disabled={submittingOffer}
                  sx={{ mb: 3 }}
                />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <MuiButton
                    onClick={() => setShowOfferModal(false)}
                    disabled={submittingOffer}
                    variant="outlined"
                    fullWidth
                  >
                    Cancel
                  </MuiButton>
                  <MuiButton
                    onClick={handleSubmitOffer}
                    variant="contained"
                    disabled={submittingOffer || offerPrice <= 0}
                    fullWidth
                  >
                    {submittingOffer ? 'Submitting...' : 'Submit Offer'}
                  </MuiButton>
                </Box>
              </Box>
            )}
          </Box>
        </SwipeableDrawer>
      </Box>
    </Box>
  );
}
