'use client';

import { Toaster } from 'react-hot-toast';
import { useThemeMode } from '../../contexts/ThemeContext';

export function ToastProvider() {
  const { mode } = useThemeMode();

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: mode === 'dark' ? '#2a2a2a' : '#ffffff',
          color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
          border: `1px solid ${mode === 'dark' ? '#3a3a3a' : '#e0e0e0'}`,
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 500,
          maxWidth: '350px',
        },
        success: {
          iconTheme: {
            primary: '#4CAF50',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#f44336',
            secondary: '#ffffff',
          },
        },
        loading: {
          iconTheme: {
            primary: '#FF9500',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}
