'use client';

import React from 'react';
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  sx?: object;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ sx }) => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <IconButton
      onClick={toggleTheme}
      sx={{
        color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        border: 1,
        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        '&:hover': {
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
        },
        ...sx,
      }}
      aria-label="Toggle theme"
    >
      {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
};
