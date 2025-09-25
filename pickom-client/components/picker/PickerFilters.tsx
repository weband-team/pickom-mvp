'use client';

import { useState, useCallback, memo } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { PriceSlider } from '../ui';
import { theme, buttonStyles } from '../../styles/theme';

interface PickerFiltersProps {
  onFiltersChange: (filters: {
    maxPrice?: number;
    maxDuration?: number;
    minTrustLevel?: number;
    sortBy: 'price' | 'duration' | 'trust' | 'rating' | 'distance';
    sortOrder: 'asc' | 'desc';
  }) => void;
}

export const PickerFilters = memo(function PickerFilters({ onFiltersChange }: PickerFiltersProps) {
  const [maxPrice, setMaxPrice] = useState<number>(30);
  const [maxDuration, setMaxDuration] = useState<number>(60);
  const [minTrustLevel, setMinTrustLevel] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'trust' | 'rating' | 'distance'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = useCallback(() => {
    onFiltersChange({
      maxPrice: maxPrice < 30 ? maxPrice : undefined,
      maxDuration: maxDuration < 60 ? maxDuration : undefined,
      minTrustLevel: minTrustLevel > 0 ? minTrustLevel : undefined,
      sortBy,
      sortOrder
    });
  }, [maxPrice, maxDuration, minTrustLevel, sortBy, sortOrder, onFiltersChange]);

  const handleSort = useCallback((newSortBy: 'price' | 'duration' | 'trust') => {
    const newOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortOrder(newOrder);
    onFiltersChange({
      maxPrice: maxPrice < 30 ? maxPrice : undefined,
      maxDuration: maxDuration < 60 ? maxDuration : undefined,
      minTrustLevel: minTrustLevel > 0 ? minTrustLevel : undefined,
      sortBy: newSortBy,
      sortOrder: newOrder
    });
  }, [sortBy, sortOrder, maxPrice, maxDuration, minTrustLevel, onFiltersChange]);

  const resetFilters = useCallback(() => {
    setMaxPrice(30);
    setMaxDuration(60);
    setMinTrustLevel(0);
    setSortBy('price');
    setSortOrder('asc');
    onFiltersChange({
      sortBy: 'price',
      sortOrder: 'asc'
    });
  }, [onFiltersChange]);

  const hasActiveFilters = maxPrice < 30 || maxDuration < 60 || minTrustLevel > 0;

  return (
    <Box sx={{ bgcolor: theme.colors.white, borderBottom: `1px solid ${theme.colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
      <Box sx={{ p: 2 }}>
        {/* Header with toggle */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Filters & Sorting
          </Typography>
          <Stack direction="row" spacing={1}>
            {hasActiveFilters && (
              <Button
                onClick={resetFilters}
                variant="contained"
                size="small"
                sx={buttonStyles.primary}
              >
                Reset
              </Button>
            )}
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outlined"
              size="small"
              sx={buttonStyles.outlined}
            >
              {isExpanded ? 'Hide' : 'Show'} filters
            </Button>
          </Stack>
        </Stack>

        {/* Quick Sort Options */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Button
            onClick={() => handleSort('price')}
            variant={sortBy === 'price' ? 'contained' : 'outlined'}
            size="small"
            sx={{
              ...(sortBy === 'price' ? buttonStyles.primary : buttonStyles.outlined)
            }}
          >
            Price {sortBy === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕️'}
          </Button>
          <Button
            onClick={() => handleSort('duration')}
            variant={sortBy === 'duration' ? 'contained' : 'outlined'}
            size="small"
            sx={{
              ...(sortBy === 'duration' ? buttonStyles.primary : buttonStyles.outlined)
            }}
          >
            Time {sortBy === 'duration' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕️'}
          </Button>
          <Button
            onClick={() => handleSort('trust')}
            variant={sortBy === 'trust' ? 'contained' : 'outlined'}
            size="small"
            sx={{
              ...(sortBy === 'trust' ? buttonStyles.primary : buttonStyles.outlined)
            }}
          >
            Trust {sortBy === 'trust' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕️'}
          </Button>
        </Stack>

        {/* Expanded Filters */}
        {isExpanded && (
          <Box sx={{ pt: 2, borderTop: `1px solid ${theme.colors.border}` }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {/* Price Filter */}
              <Box sx={{ px: 1 }}>
                <PriceSlider
                  value={maxPrice}
                  onChange={(value) => {
                    setMaxPrice(value as number);
                    handleFilterChange();
                  }}
                  min={10}
                  max={30}
                  step={1}
                  currency=" zł"
                  label="Max Price"
                  showLabels
                  showValue
                />
              </Box>

              {/* Duration Filter */}
              <Box sx={{ px: 1 }}>
                <PriceSlider
                  value={maxDuration}
                  onChange={(value) => {
                    setMaxDuration(value as number);
                    handleFilterChange();
                  }}
                  min={15}
                  max={60}
                  step={5}
                  currency=" min"
                  label="Max Duration"
                  showLabels
                  showValue
                />
              </Box>

              {/* Trust Level Filter */}
              <Box sx={{ px: 1 }}>
                <PriceSlider
                  value={minTrustLevel}
                  onChange={(value) => {
                    setMinTrustLevel(value as number);
                    handleFilterChange();
                  }}
                  min={0}
                  max={90}
                  step={10}
                  currency="%"
                  label="Min Trust Level"
                  showLabels
                  showValue
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
});