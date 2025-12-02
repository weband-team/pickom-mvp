'use client';

import { useState, useCallback, memo } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { PriceSlider } from '../ui';

interface PickerFiltersProps {
  onFiltersChange: (filters: {
    maxPrice?: number;
    maxDuration?: number;
    minTrustLevel?: number;
  }) => void;
}

export const PickerFilters = memo(function PickerFilters({ onFiltersChange }: PickerFiltersProps) {
  const [maxPrice, setMaxPrice] = useState<number>(30);
  const [maxDuration, setMaxDuration] = useState<number>(60);
  const [minTrustLevel, setMinTrustLevel] = useState<number>(0);

  const handleFilterChange = useCallback(() => {
    onFiltersChange({
      maxPrice: maxPrice < 30 ? maxPrice : undefined,
      maxDuration: maxDuration < 60 ? maxDuration : undefined,
      minTrustLevel: minTrustLevel > 0 ? minTrustLevel : undefined,
    });
  }, [maxPrice, maxDuration, minTrustLevel, onFiltersChange]);

  const resetFilters = useCallback(() => {
    setMaxPrice(30);
    setMaxDuration(60);
    setMinTrustLevel(0);
    onFiltersChange({});
  }, [onFiltersChange]);

  const hasActiveFilters = maxPrice < 30 || maxDuration < 60 || minTrustLevel > 0;

  return (
    <Box>
      {/* Header with reset */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Advanced Filters
        </Typography>
        {hasActiveFilters && (
          <Button
            onClick={resetFilters}
            variant="text"
            size="small"
            sx={{ fontSize: '0.75rem' }}
          >
            Reset
          </Button>
        )}
      </Stack>

      {/* Filter Sliders */}
      <Stack spacing={3}>
        {/* Price Filter */}
        <Box>
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
        <Box>
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
        <Box>
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
      </Stack>
    </Box>
  );
});