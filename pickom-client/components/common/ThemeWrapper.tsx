'use client';

import React, { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeModeProvider, useThemeMode } from '../../contexts/ThemeContext';
import { createPickomTheme } from '../../theme/theme';
import { ToastProvider } from './ToastProvider';

function ThemeContent({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeMode();
  const theme = useMemo(() => createPickomTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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