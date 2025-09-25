import React from 'react';
import { Box, Paper } from '@mui/material';

export interface MobileContainerProps {
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  showFrame?: boolean;
  backgroundColor?: string;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  width = 375,
  height = 812,
  showFrame = true,
  backgroundColor = '#ffffff',
}) => {
  if (!showFrame) {
    return (
      <Box
        data-mobile-container
        sx={{
          width: '100%',
          maxWidth: width,
          height: '100vh',
          maxHeight: height,
          backgroundColor,
          overflow: 'auto',
          position: 'relative',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        {children}
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
          height,
          borderRadius: 6,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor,
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
            paddingBottom: 4,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          {children}
        </Box>
      </Paper>
    </Box>
  );
};