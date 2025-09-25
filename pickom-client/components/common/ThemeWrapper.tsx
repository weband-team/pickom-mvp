'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 24,
          padding: '12px 24px',
          minHeight: 44,
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
          },
          '&.Mui-selected, &[aria-pressed="true"]': {
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '1px solid #000000',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          },
        },
        outlined: {
          border: '1px solid #000000',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            border: '1px solid #000000',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#000000',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000000',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
          color: '#000000',
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        root: {
          color: '#000000',
          '& .MuiRating-iconEmpty': {
            color: '#e0e0e0',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#000000',
          '& .MuiSlider-track': {
            backgroundColor: '#000000',
          },
          '& .MuiSlider-thumb': {
            backgroundColor: '#000000',
            '&:hover': {
              boxShadow: '0px 0px 0px 8px rgba(0, 0, 0, 0.16)',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e0e0e0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
            borderWidth: 2,
          },
        },
      },
    },
  },
});

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}