'use client';

import { lazy, Suspense } from 'react';
import { Box, Skeleton } from '@mui/material';

const PickerFilters = lazy(() =>
  import('./PickerFilters').then(module => ({ default: module.PickerFilters }))
);

interface LazyPickerFiltersProps {
  onFiltersChange: (filters: {
    maxPrice?: number;
    maxDuration?: number;
    minTrustLevel?: number;
    sortBy: 'price' | 'duration' | 'trust' | 'rating' | 'distance';
    sortOrder: 'asc' | 'desc';
  }) => void;
}

const FiltersSkeleton = () => (
  <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
    <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
    </Box>
  </Box>
);

export function LazyPickerFilters(props: LazyPickerFiltersProps) {
  return (
    <Suspense fallback={<FiltersSkeleton />}>
      <PickerFilters {...props} />
    </Suspense>
  );
}