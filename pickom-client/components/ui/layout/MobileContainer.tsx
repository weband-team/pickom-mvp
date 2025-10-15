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
          width: '100%',
          maxWidth: width,
          height: shouldShowBottomNav ? 'calc(100vh - 70px)' : '100vh',
          maxHeight: shouldShowBottomNav ? `calc(${height}px - 70px)` : height,
          bgcolor: backgroundColor || 'background.default',
          overflow: 'hidden', // Changed from 'auto' to 'hidden' to contain modals
          position: 'relative',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        <Box sx={{ paddingBottom: 0, minHeight: '100%', overflow: 'auto', height: '100%' }}>
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
            paddingTop: 6,
            overflow: 'auto',
            position: 'relative',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          <Box sx={{ paddingBottom: 4, minHeight: '100%' }}>
            {children}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};