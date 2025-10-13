'use client';

import React from 'react';
import { Rating, RatingProps, Box, Typography } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';

export interface StarRatingProps extends Omit<RatingProps, 'icon' | 'emptyIcon'> {
  showValue?: boolean;
  showLabel?: boolean;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export const StarRating: React.FC<StarRatingProps> = ({
  showValue = false,
  showLabel = false,
  label = 'Rating',
  size = 'medium',
  value = 0,
  readOnly = false,
  ...props
}) => {
  const iconSizes = {
    small: 16,
    medium: 24,
    large: 32,
  };

  const textVariants = {
    small: 'caption' as const,
    medium: 'body2' as const,
    large: 'body1' as const,
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showLabel && (
        <Typography variant={textVariants[size]}>
          {label}:
        </Typography>
      )}
      <Rating
        value={value}
        readOnly={readOnly}
        icon={<Star sx={{ fontSize: iconSizes[size] }} />}
        emptyIcon={<StarBorder sx={{ fontSize: iconSizes[size] }} />}
        sx={{
          color: '#000000',
          '& .MuiRating-iconEmpty': {
            color: '#e0e0e0',
          },
        }}
        {...props}
      />
      {showValue && (
        <Typography variant={textVariants[size]} sx={{ color: '#666666' }}>
          ({typeof value === 'number' ? value.toFixed(1) : Number(value || 0).toFixed(1)})
        </Typography>
      )}
    </Box>
  );
};