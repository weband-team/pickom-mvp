'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Stack, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import {
  MobileContainer,
  PickomLogo,
  LoadingIndicator,
  Button
} from '../../components/ui';
import { LazyPickerFilters, PickerCardMemo } from '../../components';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { Picker } from '../../types/picker';
import { theme } from '../../styles/theme';
import { mockPickers, filterPickers } from '../../data/mockPickers';

export default function PickerResultsPage() {
  const [displayedPickers, setDisplayedPickers] = useState<Picker[]>([]);
  const [filteredPickers, setFilteredPickers] = useState<Picker[]>([]);
  const [allPickers] = useState<Picker[]>(mockPickers);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const ITEMS_PER_PAGE = 10;

  // Initialize with first 10 pickers on component mount
  useEffect(() => {
    setLoading(true);

    // Simulate initial loading with minimum delay
    const timeoutId = setTimeout(() => {
      const initialPickers = allPickers.slice(0, ITEMS_PER_PAGE);
      setFilteredPickers(allPickers);
      setDisplayedPickers(initialPickers);
      setHasMore(allPickers.length > ITEMS_PER_PAGE);
      setLoading(false);
    }, 800); // Minimum 800ms to show initial loading

    return () => clearTimeout(timeoutId);
  }, [allPickers]);

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
    window.location.href = `/chat/${pickerId}`;
  }, []);

  const handleSelectPicker = useCallback((pickerId: string) => {
    console.log('Selected picker:', pickerId);
    // Add logic for picker selection
  }, []);

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
        {/* User Avatar */}
        <UserAvatar
          name="Vadim"
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
        />

        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.white,
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

        {/* Filters */}
        <Box sx={{ borderBottom: `1px solid ${theme.colors.border}` }}>
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
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.colors.border}` }}>
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
    </Box>
  );
}