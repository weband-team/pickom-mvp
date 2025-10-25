import React from 'react';
import { CircularProgress, LinearProgress, Box, Typography, Skeleton } from '@mui/material';

export interface LoadingIndicatorProps {
  type?: 'circular' | 'linear' | 'skeleton' | 'dots';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  variant?: 'determinate' | 'indeterminate';
  value?: number;
  fullScreen?: boolean;
  rows?: number;
}

const sizeMap = {
  small: 20,
  medium: 40,
  large: 60,
};

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type = 'circular',
  size = 'medium',
  text,
  variant = 'indeterminate',
  value,
  fullScreen = false,
  rows = 3,
}) => {
  const progressSize = sizeMap[size];

  const renderLoader = () => {
    switch (type) {
      case 'linear':
        return (
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant={variant}
              value={value}
              sx={{
                backgroundColor: 'action.disabledBackground',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'primary.main',
                },
              }}
            />
            {text && (
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {text}
              </Typography>
            )}
          </Box>
        );

      case 'skeleton':
        return (
          <Box sx={{ width: '100%' }}>
            {Array.from({ length: rows }).map((_, index) => (
              <Skeleton
                key={index}
                variant="text"
                sx={{
                  fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.25rem' : '1rem',
                }}
              />
            ))}
          </Box>
        );

      case 'dots':
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: progressSize / 4,
                  height: progressSize / 4,
                  backgroundColor: 'primary.main',
                  borderRadius: '50%',
                  animation: 'dotPulse 1.4s ease-in-out infinite',
                  animationDelay: `${index * 0.16}s`,
                  '@keyframes dotPulse': {
                    '0%, 80%, 100%': {
                      transform: 'scale(0)',
                    },
                    '40%': {
                      transform: 'scale(1)',
                    },
                  },
                }}
              />
            ))}
            {text && (
              <Typography variant="body2" sx={{ ml: 1 }}>
                {text}
              </Typography>
            )}
          </Box>
        );

      case 'circular':
      default:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <CircularProgress
              variant={variant}
              value={value}
              size={progressSize}
              sx={{
                color: 'primary.main',
              }}
            />
            {text && (
              <Typography variant="body2">
                {text}
              </Typography>
            )}
          </Box>
        );
    }
  };

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          zIndex: 9999,
        }}
      >
        {renderLoader()}
      </Box>
    );
  }

  return renderLoader();
};