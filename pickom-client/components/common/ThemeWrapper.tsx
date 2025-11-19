'use client';

import React, { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeModeProvider, useThemeMode } from '../../contexts/ThemeContext';
import { createPickomTheme } from '../../theme/theme';
import { ToastProvider } from './ToastProvider';

function ThemeContent({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeMode();
  const theme = useMemo(() => createPickomTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Global styles for mobile safe areas and body */}
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            // Safe area CSS variables for Capacitor/PWA
            '--safe-area-top': 'env(safe-area-inset-top, 0px)',
            '--safe-area-right': 'env(safe-area-inset-right, 0px)',
            '--safe-area-bottom': 'env(safe-area-inset-bottom, 0px)',
            '--safe-area-left': 'env(safe-area-inset-left, 0px)',
          },
          html: {
            overscrollBehavior: 'none', // Prevent pull-to-refresh
          },
          body: {
            backgroundColor: '#f5f5f5 !important',
            margin: 0,
            padding: 0,
            width: '100vw',
            minHeight: '100vh',
            overflow: 'hidden',
            position: 'fixed',
          },
          // MUI Dialog backdrop - respect safe areas
          '.MuiModal-root': {
            paddingTop: 'var(--safe-area-top)',
            paddingBottom: 'var(--safe-area-bottom)',
            paddingLeft: 'var(--safe-area-left)',
            paddingRight: 'var(--safe-area-right)',
          },
        })}
      />
      <ToastProvider />
      {children}
    </ThemeProvider>
  );
}

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeModeProvider defaultMode="light">
      <ThemeContent>{children}</ThemeContent>
    </ThemeModeProvider>
  );
}