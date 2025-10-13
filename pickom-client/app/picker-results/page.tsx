'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Stack, IconButton, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import {
  MobileContainer,
  PickomLogo,
  LoadingIndicator,
  Button
} from '../../components/ui';
import { LazyPickerFilters, PickerCardMemo } from '../../components';
import { UserAvatar } from '@/components/profile/UserAvatar';
import BottomNavigation from '../../components/common/BottomNavigation';
import { Picker } from '../../types/picker';
import { UserType } from '../../types/auth';
import { theme } from '../../styles/theme';
import { filterPickers } from '../../data/mockPickers';
import { getAvailablePickers, createDeliveryRequest, updateDeliveryRequest } from '../api/delivery';
import { notificationsAPI } from '../api/notifications';
import { getCurrentUser } from '../api/user';
import { useRouter } from 'next/navigation';

export default function PickerResultsPage() {
  const router = useRouter();
  const [displayedPickers, setDisplayedPickers] = useState<Picker[]>([]);
  const [filteredPickers, setFilteredPickers] = useState<Picker[]>([]);
  const [allPickers, setAllPickers] = useState<Picker[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreatingDelivery, setIsCreatingDelivery] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const ITEMS_PER_PAGE = 10;

  // Fetch pickers from backend on component mount
  useEffect(() => {
    const fetchPickers = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getAvailablePickers();
        console.log('Raw pickers from backend:', response.data);
        const pickers = response.data.map((picker: any) => ({
          // BaseUserData fields
          id: picker.uid,
          fullName: picker.name,
          email: picker.email,
          age: 0, // TODO: add to backend
          country: '', // TODO: add to backend
          city: '', // TODO: add to backend
          phoneNumber: picker.phone || '',
          isVerified: true,
          avatarUrl: picker.avatarUrl || '',
          description: '',
          userType: UserType.PICKER,
          rating: Number(picker.rating) || 0,

          // Picker specific fields
          trustLevel: (Number(picker.rating) || 0) * 20, // Convert 0-5 rating to 0-100 trust
          price: Number(picker.price) || 15.00,
          duration: Math.floor(Math.random() * 60) + 10, // TODO: get from backend
          reviewCount: picker.totalRatings || 0,
          isOnline: picker.isOnline || false,
          isPhoneVerified: !!picker.phone,
          isEmailVerified: true,
          distance: Math.floor(Math.random() * 20) + 1, // TODO: get from backend
          vehicle: 'car' as const, // TODO: get from backend
          completedDeliveries: 0, // TODO: get from backend
          deliveryCount: 0, // TODO: get from backend
        }));

        console.log('Mapped pickers:', pickers);
        setAllPickers(pickers);
        setFilteredPickers(pickers);
        const initialPickers = pickers.slice(0, ITEMS_PER_PAGE);
        setDisplayedPickers(initialPickers);
        setHasMore(pickers.length > ITEMS_PER_PAGE);
      } catch (err: any) {
        console.error('Failed to fetch pickers:', err);
        setError('Failed to load pickers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPickers();
  }, []);

  // Handle filtered pickers change with loading state
  useEffect(() => {
    if (filteredPickers.length > 0) {
      setLoading(true);

      // Small delay to show loading state
      const timeoutId = setTimeout(() => {
        const firstPage = filteredPickers.slice(0, ITEMS_PER_PAGE);
        setDisplayedPickers(firstPage);
        setCurrentPage(0);
        setHasMore(filteredPickers.length > ITEMS_PER_PAGE);
        setLoading(false);
      }, 500); // 500ms delay to show loading state properly

      return () => clearTimeout(timeoutId);
    }
  }, [filteredPickers]);

  // Handle filter changes
  const handleFiltersChange = useCallback((filters: {
    maxPrice?: number;
    maxDuration?: number;
    minTrustLevel?: number;
    sortBy: 'price' | 'duration' | 'trust' | 'rating' | 'distance';
    sortOrder: 'asc' | 'desc';
  }) => {
    const filtered = filterPickers(allPickers, filters);
    setFilteredPickers(filtered);
  }, [allPickers]);

  // State for sort
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'trust' | 'rating' | 'distance'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Handle sort by price
  const handleSortByPrice = () => {
    const newOrder = sortBy === 'price' && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy('price');
    setSortOrder(newOrder);
    handleFiltersChange({
      sortBy: 'price',
      sortOrder: newOrder
    });
  };

  // Load more pickers with realistic loading delay
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);

    // Add realistic loading delay for better UX
    const timeoutId = setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = nextPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newPickers = filteredPickers.slice(startIndex, endIndex);

      if (newPickers.length > 0) {
        setDisplayedPickers(prev => [...prev, ...newPickers]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < filteredPickers.length);
      } else {
        setHasMore(false);
      }

      setLoading(false);
    }, 600); // 600ms delay for load more

    // Cleanup function would be handled by component unmount
    return timeoutId;
  }, [currentPage, filteredPickers, loading, hasMore]);

  // Infinite scroll detection for mobile container
  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 100) {
        loadMore();
      }
    };

    // Find the scrollable container
    const container = document.querySelector('[data-mobile-container]');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [loadMore]);

  const handleChat = useCallback((pickerId: string) => {
    console.log('Chat with picker:', pickerId);
    localStorage.setItem('selectedPickerId', pickerId);
    window.location.href = `/chat/${pickerId}`;
  }, []);

  const handleSelectPicker = useCallback(async (pickerId: string) => {
    console.log('Selected picker:', pickerId);

    // Get delivery data from localStorage (set by package-type page)
    const deliveryData = localStorage.getItem('deliveryData');
    if (!deliveryData) {
      setError('Delivery information not found. Please start from the beginning.');
      setTimeout(() => router.push('/delivery-methods'), 2000);
      return;
    }

    const parsedData = JSON.parse(deliveryData);
    const deliveryId = parsedData.deliveryId;

    if (!deliveryId) {
      setError('Delivery ID not found. Please start from the beginning.');
      setTimeout(() => router.push('/delivery-methods'), 2000);
      return;
    }

    const selectedPicker = allPickers.find(p => p.id === pickerId);

    if (!selectedPicker) {
      setError('Picker not found');
      return;
    }

    setIsCreatingDelivery(true);
    setError('');

    try {
      // Get current user (sender) info
      const { user: currentUser } = await getCurrentUser();

      // DON'T assign picker yet - just send invitation notification
      // The picker will create an offer, and sender will accept it

      // Send notification to picker about delivery request invitation
      try {
        await notificationsAPI.createNotification({
          user_id: pickerId,
          title: 'New Delivery Invitation',
          message: `${currentUser.name} invited you to deliver a package from ${parsedData.fromAddress || 'pickup location'} to ${parsedData.toAddress || 'delivery location'}. Check the delivery details and make an offer if interested.`,
          type: 'new_delivery',
          read: false,
          related_delivery_id: deliveryId,
        });
        console.log('Invitation notification sent to picker');
      } catch (notifErr) {
        console.error('Failed to send notification:', notifErr);
        throw notifErr; // Fail the operation if notification fails
      }

      setSuccessMessage(`Invitation sent to ${selectedPicker.fullName}! They will be notified and can make an offer.`);
      localStorage.setItem('selectedPickerId', pickerId);

      // Redirect to delivery-methods manage tab after 2 seconds
      setTimeout(() => {
        router.push('/delivery-methods?tab=manage');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to send invitation:', err);
      setError(err.response?.data?.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsCreatingDelivery(false);
    }
  }, [allPickers, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 375, height: 812 }}>
        <MobileContainer showFrame={false}>
          {/* User Avatar */}
          <UserAvatar
            name="Vadim"
            sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
          />

          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 100,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => window.history.back()}
                size="small"
                sx={{ p: 1 }}
              >
                <ArrowBack />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Available Pickers
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Found {filteredPickers.length} pickers in your area
                </Typography>
              </Box>
              <PickomLogo variant="icon" size="small" />
            </Stack>
          </Box>

          {/* Success Alert */}
          {successMessage && (
            <Box sx={{ p: 2 }}>
              <Alert severity="success">{successMessage}</Alert>
            </Box>
          )}

          {/* Error Alert */}
          {error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {/* Filters */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant={showFilters ? 'contained' : 'outlined'}
                  onClick={() => setShowFilters(!showFilters)}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Filters
                </Button>
                <Button
                  variant={sortBy === 'price' ? 'contained' : 'outlined'}
                  size="small"
                  sx={{ flex: 1 }}
                  onClick={handleSortByPrice}
                >
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
              </Stack>
            </Box>

            {/* Full Filters */}
            {showFilters && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <LazyPickerFilters onFiltersChange={handleFiltersChange} />
              </Box>
            )}
          </Box>

          {/* Results */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading && displayedPickers.length === 0 ? (
              <Box sx={{ py: 8 }}>
                <LoadingIndicator
                  type="dots"
                  text="Loading pickers..."
                />
              </Box>
            ) : displayedPickers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                  📦
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  No pickers found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search filters
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {displayedPickers.map((picker) => (
                    <PickerCardMemo
                      key={picker.id}
                      picker={picker}
                      onChat={handleChat}
                      onSelect={handleSelectPicker}
                    />
                  ))}
                </Stack>

                {/* Loading indicator for load more */}
                {loading && displayedPickers.length > 0 && (
                  <Box sx={{ py: 4 }}>
                    <LoadingIndicator
                      type="dots"
                      text="Loading more pickers..."
                    />
                  </Box>
                )}

                {/* Load more button */}
                {hasMore && !loading && (
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Button variant="outlined" onClick={loadMore}>
                      Load More
                    </Button>
                  </Box>
                )}

                {/* End of results */}
                {!hasMore && displayedPickers.length > 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      All pickers loaded ({displayedPickers.length} of {filteredPickers.length})
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </MobileContainer>
        <BottomNavigation />
      </Box>
    </Box>
  );
}