'use client';

import { useState, useEffect, useMemo } from 'react';
import { use } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Divider,
} from '@mui/material';
import { ArrowBack, LocalOffer, AccountBalanceWallet, CreditCard, Add } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import OfferCard, { OfferData } from '@/components/offer/OfferCard';
import { PickerCardData } from '@/components/picker/PickerCardComponent';
import { getOffersByDelivery, updateOfferStatus, Offer } from '@/app/api/offers';
import { getDeliveryRequestById, updateDeliveryRequest } from '@/app/api/delivery';
import { getUser, getUserBalance } from '@/app/api/user';
import { createChat } from '@/app/api/chat';
import { handleMe } from '@/app/api/auth';
import PaymentMethodSelector from '@/app/components/payment/PaymentMethodSelector';
import axios from 'axios';


type OfferStatus = 'all' | 'pending' | 'accepted' | 'rejected';

interface OfferWithPicker extends Offer {
  picker?: PickerCardData;
}

export default function DeliveryOffersPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const deliveryId = Number(resolvedParams.id);

  const [offers, setOffers] = useState<OfferWithPicker[]>([]);
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<OfferStatus>('all');
  const [currentUserBalance, setCurrentUserBalance] = useState<number>(0);
  const [currentUserUid, setCurrentUserUid] = useState<string>('');

  // Accept/Reject confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'accept' | 'reject' | null;
    offerId: number | null;
  }>({
    open: false,
    type: null,
    offerId: null,
  });

  // Payment method selection dialog
  const [paymentMethodDialog, setPaymentMethodDialog] = useState<{
    open: boolean;
    offerId: number | null;
    offerPrice: number;
  }>({
    open: false,
    offerId: null,
    offerPrice: 0,
  });

  // Selected payment method (balance or card ID)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{
    type: 'balance' | 'card' | null;
    cardId?: string;
  }>({
    type: null,
  });

  const [showCardSelector, setShowCardSelector] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Fetch offers and delivery data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        // Fetch current user and balance
        const userResponse = await handleMe();
        const userData = userResponse.data.user;
        setCurrentUserUid(userData.uid);

        const balanceResponse = await getUserBalance(userData.uid);
        setCurrentUserBalance(Number(balanceResponse.balance) || 0);

        // Fetch delivery to get price
        const deliveryResponse = await getDeliveryRequestById(deliveryId);
        setDeliveryPrice(deliveryResponse.data.price);

        // Fetch offers
        const offersResponse = await getOffersByDelivery(deliveryId);
        const offersData = offersResponse.data;

        // Fetch picker data for each offer
        const offersWithPickers = await Promise.all(
          offersData.map(async (offer) => {
            try {
              // Get picker user data
              const userResponse = await getUser(offer.pickerId);
              const userData = userResponse.user;

              // Map to PickerCardData format
              const pickerData: PickerCardData = {
                uid: userData.uid,
                fullName: userData.name,
                avatarUrl: userData.avatarUrl,
                rating: 4.5, // TODO: Get from backend when available
                reviewCount: 42, // TODO: Get from backend
                completedDeliveries: 100, // TODO: Get from backend
                vehicle: 'Car', // TODO: Get from backend
                isVerified: true, // TODO: Get from backend
                isPhoneVerified: userData.phone ? true : false,
                isEmailVerified: true,
                trustLevel: 85, // TODO: Get from backend
              };

              return {
                ...offer,
                picker: pickerData,
              };
            } catch {              return offer;
            }
          })
        );

        setOffers(offersWithPickers);
      } catch {        setError('Failed to load offers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deliveryId]);

  // Filter offers by status
  const filteredOffers = useMemo(() => {
    if (selectedTab === 'all') return offers;
    return offers.filter(offer => offer.status === selectedTab);
  }, [offers, selectedTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: OfferStatus) => {
    setSelectedTab(newValue);
  };

  const handleBack = () => {
    router.push(`/delivery-methods?tab=manage`);
  };

  const handleChat = async (pickerId: string) => {
    try {
      const response = await createChat({
        participantId: pickerId,
        deliveryId: deliveryId,
      });
      const { chatId } = response.data;
      router.push(`/chat/${chatId}`);
    } catch {      alert('Failed to open chat. Please try again.');
    }
  };

  const handleAccept = async (offerId: number) => {
    // Find the offer to check its price
    const selectedOffer = offers.find(o => o.id === offerId);
    if (!selectedOffer) {
      alert('Offer not found');
      return;
    }

    // Re-fetch current balance to ensure it's up to date
    try {
      const balanceResponse = await getUserBalance(currentUserUid);
      const latestBalance = Number(balanceResponse.balance) || 0;
      setCurrentUserBalance(latestBalance);

      // Show payment method selection dialog
      setPaymentMethodDialog({
        open: true,
        offerId,
        offerPrice: selectedOffer.price,
      });
    } catch {
      alert('Failed to verify balance. Please try again.');
    }
  };

  const handlePayWithBalance = async () => {
    if (!paymentMethodDialog.offerId) return;

    const offerPrice = Number(paymentMethodDialog.offerPrice || 0);

    // Check if balance is sufficient
    if (currentUserBalance < offerPrice) {
      alert(`Insufficient balance. You need $${(offerPrice - currentUserBalance).toFixed(2)} more. Please top up your balance first.`);
      return;
    }

    // Set payment method and close payment dialog
    setSelectedPaymentMethod({ type: 'balance' });
    setPaymentMethodDialog({ open: false, offerId: null, offerPrice: 0 });

    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      type: 'accept',
      offerId: paymentMethodDialog.offerId,
    });
  };

  const handlePayWithCard = (cardId: string) => {
    if (!paymentMethodDialog.offerId) return;

    // Set payment method and close dialogs
    setSelectedPaymentMethod({ type: 'card', cardId });
    setShowCardSelector(false);
    setPaymentMethodDialog({ open: false, offerId: null, offerPrice: 0 });

    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      type: 'accept',
      offerId: paymentMethodDialog.offerId,
    });
  };

  const handleReject = (offerId: number) => {
    setConfirmDialog({
      open: true,
      type: 'reject',
      offerId,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.offerId) return;

    setProcessing(true);

    try {
      const newStatus = confirmDialog.type === 'accept' ? 'accepted' : 'rejected';
      const selectedOffer = offers.find(o => o.id === confirmDialog.offerId);

      if (!selectedOffer) {
        alert('Offer not found');
        return;
      }

      if (confirmDialog.type === 'accept') {
        const API_URL = process.env.NEXT_PUBLIC_SERVER || 'http://localhost:4242';

        // Process payment based on selected method
        if (selectedPaymentMethod.type === 'card' && selectedPaymentMethod.cardId) {
          try {
            // Create payment intent with saved card
            await axios.post(
              `${API_URL}/payment/create-intent`,
              {
                amount: Number(selectedOffer.price),
                deliveryId: deliveryId,
                description: `Payment for delivery #${deliveryId}`,
                paymentMethodId: selectedPaymentMethod.cardId,
                toUserId: selectedOffer.pickerId,
              },
              { withCredentials: true }
            );
          } catch (err) {
            console.error('Payment failed:', err);
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = error.response?.data?.message || error.message || 'Payment failed';
            alert(`Payment failed: ${errorMessage}`);
            setProcessing(false);
            return;
          }
        } else if (selectedPaymentMethod.type === 'balance') {
          try {
            // Pay with balance
            await axios.post(
              `${API_URL}/payment/pay-with-balance`,
              {
                amount: Number(selectedOffer.price),
                deliveryId: deliveryId,
                description: `Payment for delivery #${deliveryId}`,
                toUserId: selectedOffer.pickerId,
              },
              { withCredentials: true }
            );
          } catch (err) {
            console.error('Balance payment failed:', err);
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = error.response?.data?.message || error.message || 'Payment failed';
            alert(`Payment failed: ${errorMessage}`);
            setProcessing(false);
            return;
          }
        }

        // Update offer status
        await updateOfferStatus(confirmDialog.offerId, { status: newStatus });

        // Assign picker to delivery and update status to 'accepted'
        await updateDeliveryRequest(deliveryId, {
          pickerId: selectedOffer.pickerId,
          status: 'accepted'
        });

        // Auto-reject all other pending offers
        const pendingOffers = offers.filter(
          o => o.id !== confirmDialog.offerId && o.status === 'pending'
        );

        await Promise.all(
          pendingOffers.map(offer =>
            updateOfferStatus(offer.id, { status: 'rejected' })
          )
        );

        alert('Offer accepted! Payment processed and picker assigned.');
        router.push(`/delivery-methods?tab=manage`);
      } else {
        // Update offer status
        await updateOfferStatus(confirmDialog.offerId, { status: newStatus });

        // Update local state for rejected offer
        setOffers(prev =>
          prev.map(offer =>
            offer.id === confirmDialog.offerId
              ? { ...offer, status: 'rejected' as const }
              : offer
          )
        );

        alert('Offer rejected. The picker has been notified.');
      }
    } catch {      alert('Failed to update offer. Please try again.');
    } finally {
      setProcessing(false);
      setConfirmDialog({ open: false, type: null, offerId: null });
    }
  };

  const handleCancelDialog = () => {
    setConfirmDialog({ open: false, type: null, offerId: null });
  };

  // Empty state messages
  const getEmptyMessage = () => {
    const messages = {
      all: {
        icon: '📭',
        title: 'No offers yet',
        description: 'Pickers will see your delivery and can make offers.',
      },
      pending: {
        icon: '⏳',
        title: 'No pending offers',
        description: 'All offers have been reviewed.',
      },
      accepted: {
        icon: '✅',
        title: 'No accepted offers',
        description: 'Accepted offers will appear here.',
      },
      rejected: {
        icon: '❌',
        title: 'No rejected offers',
        description: 'Rejected offers will appear here.',
      },
    };

    return messages[selectedTab];
  };

  const renderEmptyState = () => {
    const message = getEmptyMessage();

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 3,
        }}
      >
        <Typography sx={{ fontSize: '4rem', mb: 2 }}>
          {message.icon}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
          {message.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {message.description}
        </Typography>
      </Box>
    );
  };

  // Count offers by status
  const offerCounts = useMemo(() => {
    return {
      all: offers.length,
      pending: offers.filter(o => o.status === 'pending').length,
      accepted: offers.filter(o => o.status === 'accepted').length,
      rejected: offers.filter(o => o.status === 'rejected').length,
    };
  }, [offers]);

  return (
    <>
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
                gap: 1,
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <IconButton onClick={handleBack} size="small">
                <ArrowBack />
              </IconButton>
              <LocalOffer sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                Delivery #{deliveryId} - Offers
              </Typography>
            </Box>

            {/* Tabs */}
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                minHeight: 48,
                '& .MuiTab-root': {
                  minHeight: 48,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                },
              }}
            >
              <Tab label={`All (${offerCounts.all})`} value="all" />
              <Tab label={`Pending (${offerCounts.pending})`} value="pending" />
              <Tab label={`Accepted (${offerCounts.accepted})`} value="accepted" />
              <Tab label={`Rejected (${offerCounts.rejected})`} value="rejected" />
            </Tabs>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                pb: 8,
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ p: 3 }}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              ) : filteredOffers.length === 0 ? (
                renderEmptyState()
              ) : (
                <Box sx={{ p: 2 }}>
                  {filteredOffers.map((offer) => (
                    offer.picker ? (
                      <OfferCard
                        key={offer.id}
                        offer={{
                          id: offer.id,
                          pickerId: offer.pickerId,
                          price: offer.price,
                          message: offer.message,
                          status: offer.status,
                          createdAt: offer.createdAt instanceof Date ? offer.createdAt.toISOString() : offer.createdAt,
                        }}
                        picker={offer.picker}
                        originalPrice={deliveryPrice}
                        onChat={() => handleChat(offer.pickerId)}
                        onAccept={() => handleAccept(offer.id)}
                        onReject={() => handleReject(offer.id)}
                        disabled={processing}
                      />
                    ) : (
                      <Box key={offer.id} sx={{ p: 2, mb: 2 }}>
                        <Alert severity="warning">
                          Unable to load picker data for offer #{offer.id}
                        </Alert>
                      </Box>
                    )
                  ))}
                </Box>
              )}
            </Box>
        </Box>
      </MobileContainer>
      <BottomNavigation />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelDialog}
        maxWidth="xs"
        fullWidth
      >
          <DialogTitle>
            {confirmDialog.type === 'accept' ? 'Accept Offer?' : 'Reject Offer?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {confirmDialog.type === 'accept' ? (
                <>
                  You are about to accept this offer. The picker will be assigned to your delivery
                  and all other pending offers will be automatically rejected.
                </>
              ) : (
                <>
                  You are about to reject this offer. The picker will be notified.
                  This action cannot be undone.
                </>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCancelDialog} variant="outlined" disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              variant="contained"
              color={confirmDialog.type === 'accept' ? 'success' : 'error'}
              disabled={processing}
            >
              {processing ? 'Processing...' : confirmDialog.type === 'accept' ? 'Accept' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

      {/* Payment Method Selection Dialog */}
      <Dialog
        open={paymentMethodDialog.open}
        onClose={() => setPaymentMethodDialog({ open: false, offerId: null, offerPrice: 0 })}
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
              Choose how you want to pay ${paymentMethodDialog.offerPrice.toFixed(2)} for this delivery
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Pay with Balance */}
              <Button
                variant="outlined"
                startIcon={<AccountBalanceWallet />}
                onClick={handlePayWithBalance}
                fullWidth
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                }}
              >
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography variant="body1">Pay with Balance</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current balance: ${currentUserBalance.toFixed(2)}
                  </Typography>
                </Box>
              </Button>

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

              {/* Manage Cards */}
              <Button
                variant="text"
                startIcon={<Add />}
                onClick={() => router.push('/payment-methods')}
                fullWidth
                sx={{
                  py: 1,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                }}
              >
                Manage Payment Methods
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="caption" color="text.secondary">
              All payments are securely processed
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentMethodDialog({ open: false, offerId: null, offerPrice: 0 })} color="inherit">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Card Selector Modal */}
      <PaymentMethodSelector
        open={showCardSelector}
        onClose={() => setShowCardSelector(false)}
        onCardSelected={handlePayWithCard}
        title="Select Card for Payment"
      />
    </>
  );
}
