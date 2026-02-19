'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { usePathname } from 'next/navigation';

export interface MobileContainerProps {
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  showFrame?: boolean;
  backgroundColor?: string;
  showBottomNav?: boolean;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  width = 375,
  height = 812,
  showFrame = true,
  backgroundColor,
  showBottomNav = true,
}) => {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');
  const shouldShowBottomNav = showBottomNav && !isAuthPage;

  if (!showFrame) {
    return (
      <Box
        data-mobile-container
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: backgroundColor || 'background.default',
          overflow: 'hidden',
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          // Top padding to start BELOW status bar
          pt: 'env(safe-area-inset-top)',
          // Bottom padding for bottom navigation
          pb: shouldShowBottomNav ? '68px' : 0,
          margin: 0,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        <Box sx={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          margin: 0,
          padding: 0,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}>
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width,
          height: shouldShowBottomNav ? `calc(${height}px - 70px)` : height,
          borderRadius: 6,
          overflow: 'hidden',
          position: 'relative',
          bgcolor: backgroundColor || 'background.default',
          border: '8px solid #000000',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 134,
            height: 6,
            backgroundColor: '#000000',
            borderRadius: 3,
            zIndex: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 134,
            height: 5,
            backgroundColor: '#000000',
            borderRadius: 2.5,
            zIndex: 1,
          },
        }}
      >
        <Box
          data-mobile-container
          sx={{
            width: '100%',
            height: '100%',
            // Combine notch padding with safe area
            paddingTop: 'calc(24px + var(--safe-area-top))',
            overflow: 'auto',
            position: 'relative',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          <Box sx={{ paddingBottom: 'calc(16px + var(--safe-area-bottom))', minHeight: '100%' }}>
            {children}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};