'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Stack, IconButton, Alert, ToggleButtonGroup, ToggleButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ArrowBack, ViewList, Map as MapIcon, FilterList } from '@mui/icons-material';
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
import { filterPickers } from '../../data/mockPickers';
import { getNearbyPickers, getAvailablePickers } from '../api/delivery';
import { notificationsAPI } from '../api/notifications';
import { getCurrentUser } from '../api/user';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import dynamic from 'next/dynamic';

// Lazy load map component to avoid SSR issues
const PickersMap = dynamic(() => import('../../components/picker/PickersMap'), {
  ssr: false,
  loading: () => {
    console.log('PickersMap is loading...');
    return <LoadingIndicator type="dots" text="Loading map..." />;
  }
});

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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [deliveryType, setDeliveryType] = useState<'within-city' | 'suburban' | 'inter-city'>('within-city');
  const [fromLocation, setFromLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'trust' | 'rating' | 'distance'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const ITEMS_PER_PAGE = 10;

  // Fetch pickers from backend on component mount or when deliveryType changes
  useEffect(() => {
    const fetchPickers = async () => {
      setLoading(true);
      setError('');

      try {
        // Get fromLocation from localStorage (set by package-type page)
        const deliveryData = localStorage.getItem('deliveryData');
        let location: { lat: number; lng: number } | null = null;

        if (deliveryData) {
          const parsed = JSON.parse(deliveryData);
          if (parsed.fromLocation) {
            location = {
              lat: parsed.fromLocation.lat,
              lng: parsed.fromLocation.lng
            };
            setFromLocation(location);
          }
        }

        let response;
        if (location) {
          // Use nearby API with real distance calculation
          response = await getNearbyPickers(location.lat, location.lng, deliveryType);
        } else {
          // Fallback to all pickers
          response = await getAvailablePickers();
        }

        const pickers = response.data.map((picker: any) => ({
          // BaseUserData fields
          id: picker.uid,
          fullName: picker.name,
          email: picker.email,
          age: 0,
          country: '',
          city: '',
          phoneNumber: picker.phone || '',
          isVerified: true,
          avatarUrl: picker.avatarUrl || '',
          description: '',
          userType: UserType.PICKER,
          rating: Number(picker.rating) || 0,

          // Picker specific fields
          trustLevel: (Number(picker.rating) || 0) * 20,
          price: Number(picker.price) || 15.00,
          duration: picker.estimatedTime || Math.floor(Math.random() * 60) + 10,
          reviewCount: picker.totalRatings || 0,
          isOnline: picker.isOnline || false,
          isPhoneVerified: !!picker.phone,
          isEmailVerified: true,
          distance: picker.distance || 0,
          vehicle: 'car' as const,
          completedDeliveries: picker.completedDeliveries || 0,
          deliveryCount: picker.completedDeliveries || 0,
          location: picker.location,
          estimatedTime: picker.estimatedTime,
        }));

        setAllPickers(pickers);
        setFilteredPickers(pickers);
        const initialPickers = pickers.slice(0, ITEMS_PER_PAGE);
        setDisplayedPickers(initialPickers);
        setHasMore(pickers.length > ITEMS_PER_PAGE);
      } catch {
        setError('Failed to load pickers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPickers();
  }, [deliveryType]);

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

  // Handle filter changes (from sliders only)
  const handleFiltersChange = useCallback((filters: {
    maxPrice?: number;
    maxDuration?: number;
    minTrustLevel?: number;
  }) => {
    const filtered = filterPickers(allPickers, {
      ...filters,
      sortBy,
      sortOrder
    });
    setFilteredPickers(filtered);
  }, [allPickers, sortBy, sortOrder]);

  // Handle sort button clicks
  const handleSort = useCallback((newSortBy: 'price' | 'duration' | 'trust') => {
    const newOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortOrder(newOrder);

    const filtered = filterPickers(allPickers, {
      sortBy: newSortBy,
      sortOrder: newOrder
    });
    setFilteredPickers(filtered);
  }, [sortBy, sortOrder, allPickers]);


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
    localStorage.setItem('selectedPickerId', pickerId);
    window.location.href = `/chat/${pickerId}`;
  }, []);

  const handleSelectPicker = useCallback(async (pickerId: string) => {
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
      } catch (notifErr) {
        throw notifErr; // Fail the operation if notification fails
      }

      setSuccessMessage(`Invitation sent to ${selectedPicker.fullName}! They will be notified and can make an offer.`);
      localStorage.setItem('selectedPickerId', pickerId);

      // Redirect to delivery-methods manage tab after 2 seconds
      setTimeout(() => {
        router.push('/delivery-methods?tab=manage');
      }, 2000);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsCreatingDelivery(false);
    }
  }, [allPickers, router]);

  return (
    <>
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
                  Available Pickers {viewMode === 'map' ? '(Map View)' : '(List View)'}
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

          {/* View Toggle & Delivery Type */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {/* View Mode Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, value) => {
                  console.log('View mode changing to:', value);
                  if (value) setViewMode(value);
                }}
                size="small"
              >
                <ToggleButton value="list">
                  <ViewList fontSize="small" />
                </ToggleButton>
                <ToggleButton value="map">
                  <MapIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Delivery Type Selector */}
              <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                <InputLabel>Radius</InputLabel>
                <Select
                  value={deliveryType}
                  label="Radius"
                  onChange={(e) => setDeliveryType(e.target.value as any)}
                >
                  <MenuItem value="within-city">City (10 km)</MenuItem>
                  <MenuItem value="suburban">Suburban (25 km)</MenuItem>
                  <MenuItem value="inter-city">Inter-city (50 km)</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Sort & Filters - Single Row */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
                <Button
                  onClick={() => handleSort('price')}
                  variant={sortBy === 'price' ? 'contained' : 'outlined'}
                  size="small"
                  sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                >
                  Price {sortBy === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </Button>
                <Button
                  onClick={() => handleSort('duration')}
                  variant={sortBy === 'duration' ? 'contained' : 'outlined'}
                  size="small"
                  sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                >
                  Time {sortBy === 'duration' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </Button>
                <Button
                  onClick={() => handleSort('trust')}
                  variant={sortBy === 'trust' ? 'contained' : 'outlined'}
                  size="small"
                  sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                >
                  Trust {sortBy === 'trust' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </Button>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<FilterList />}
                  sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                >
                  Filters
                </Button>
              </Stack>
            </Box>

            {/* Advanced Filters (sliders) */}
            {showFilters && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <LazyPickerFilters onFiltersChange={handleFiltersChange} />
              </Box>
            )}
          </Box>

          {/* Results */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading && filteredPickers.length === 0 ? (
              <Box sx={{ py: 8 }}>
                <LoadingIndicator
                  type="dots"
                  text="Loading pickers..."
                />
              </Box>
            ) : filteredPickers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                  📦
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  No pickers found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {fromLocation
                    ? 'No pickers available within this radius. Try increasing the search area.'
                    : 'Try adjusting your search filters'}
                </Typography>
              </Box>
            ) : viewMode === 'map' ? (
              /* Map View */
              <>
                {console.log('Rendering map view. Pickers:', filteredPickers.length, 'FromLocation:', fromLocation)}
                <Box sx={{ position: 'relative', width: '100%', height: 'calc(100vh - 300px)', minHeight: 400 }}>
                  <PickersMap
                    pickers={filteredPickers}
                    fromLocation={fromLocation}
                    onSelectPicker={handleSelectPicker}
                    onChatPicker={handleChat}
                    searchRadius={deliveryType === 'within-city' ? 10 : deliveryType === 'suburban' ? 25 : 50}
                  />
                </Box>
              </>
            ) : (
              /* List View */
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
    </>
  );
}