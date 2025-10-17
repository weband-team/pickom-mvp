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
} from '@mui/material';
import { ArrowBack, LocalOffer } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/ui/layout/MobileContainer';
import BottomNavigation from '@/components/common/BottomNavigation';
import OfferCard, { OfferData } from '@/components/offer/OfferCard';
import { PickerCardData } from '@/components/picker/PickerCardComponent';
import { getOffersByDelivery, updateOfferStatus } from '@/app/api/offers';
import { getDeliveryRequestById, updateDeliveryRequest } from '@/app/api/delivery';
import { getUser, getUserBalance } from '@/app/api/user';
import { createChat } from '@/app/api/chat';
import { handleMe } from '@/app/api/auth';

type OfferStatus = 'all' | 'pending' | 'accepted' | 'rejected';

interface OfferWithPicker extends OfferData {
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

  // Insufficient funds dialog
  const [insufficientFundsDialog, setInsufficientFundsDialog] = useState<{
    open: boolean;
    required: number;
    current: number;
  }>({
    open: false,
    required: 0,
    current: 0,
  });

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
          offersData.map(async (offer: any) => {
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
            } catch (err) {
              console.error(`Failed to fetch picker data for offer ${offer.id}:`, err);
              return offer;
            }
          })
        );

        setOffers(offersWithPickers);
      } catch (err: any) {
        console.error('Failed to fetch offers:', err);
        setError('Failed to load offers. Please try again.');
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
    router.push(`/orders/${deliveryId}`);
  };

  const handleChat = async (pickerId: string) => {
    try {
      const response = await createChat({
        participantId: pickerId,
        deliveryId: deliveryId,
      });
      const { chatId } = response.data;
      router.push(`/chat/${chatId}`);
    } catch (err: any) {
      console.error('Failed to create chat:', err);
      alert('Failed to open chat. Please try again.');
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

      // Check if user has sufficient balance
      if (latestBalance < selectedOffer.price) {
        setInsufficientFundsDialog({
          open: true,
          required: selectedOffer.price,
          current: latestBalance,
        });
        return;
      }

      // Sufficient balance, show confirmation dialog
      setConfirmDialog({
        open: true,
        type: 'accept',
        offerId,
      });
    } catch (err) {
      console.error('Failed to check balance:', err);
      alert('Failed to verify balance. Please try again.');
    }
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

      // Update offer status
      await updateOfferStatus(confirmDialog.offerId, { status: newStatus });

      if (confirmDialog.type === 'accept') {
        // 1. Assign picker to delivery and update status to 'accepted'
        await updateDeliveryRequest(deliveryId, {
          pickerId: selectedOffer.pickerId,
          status: 'accepted'
        });

        // 3. Auto-reject all other pending offers
        const pendingOffers = offers.filter(
          o => o.id !== confirmDialog.offerId && o.status === 'pending'
        );

        await Promise.all(
          pendingOffers.map(offer =>
            updateOfferStatus(offer.id, { status: 'rejected' })
          )
        );

        alert('Offer accepted! The picker has been assigned and other offers have been rejected.');
        router.push(`/orders/${deliveryId}`);
      } else {
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
    } catch (err: any) {
      console.error('Failed to update offer:', err);
      alert('Failed to update offer. Please try again.');
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
                        offer={offer}
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

        {/* Insufficient Funds Dialog */}
        <Dialog
          open={insufficientFundsDialog.open}
          onClose={() => setInsufficientFundsDialog({ open: false, required: 0, current: 0 })}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            Insufficient Balance
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              You don't have enough balance to accept this offer. Please top up your account to continue.
            </DialogContentText>
            <Box sx={{
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Current Balance:</Typography>
                <Typography variant="body2" fontWeight={600}>${insufficientFundsDialog.current.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Required Amount:</Typography>
                <Typography variant="body2" fontWeight={600} color="error">${insufficientFundsDialog.required.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">Need to Add:</Typography>
                <Typography variant="body1" fontWeight={700} color="primary">${(insufficientFundsDialog.required - insufficientFundsDialog.current).toFixed(2)}</Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setInsufficientFundsDialog({ open: false, required: 0, current: 0 })}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={() => router.push('/earnings/top-up')}
              variant="contained"
              color="primary"
            >
              Top Up Balance
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
