// Centralized color palette for Pickom app
// Based on reference design with support for light and dark themes

export const colors = {
  // Primary colors (Orange accent from reference design)
  primary: {
    main: '#FF9500',
    light: '#FFB340',
    dark: '#E68600',
    contrastText: '#000000',
  },

  // Avatar color (Unified indigo for all avatars)
  avatar: {
    main: '#6366F1',
    light: '#8B8EF5',
    dark: '#4F46E5',
  },

  // Status colors
  status: {
    active: '#FFC107',      // Yellow
    confirmed: '#2196F3',   // Blue
    completed: '#4CAF50',   // Green
    cancelled: '#9E9E9E',   // Grey
    error: '#f44336',       // Red
  },

  // Light theme
  light: {
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      elevated: '#f5f5f5',
      hover: '#f9f9f9',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      disabled: '#9e9e9e',
    },
    border: {
      main: '#e0e0e0',
      light: '#f0f0f0',
      dark: '#d0d0d0',
    },
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
    },
  },

  // Dark theme (from reference design)
  dark: {
    background: {
      default: '#000000',
      paper: '#1a1a1a',
      elevated: '#2a2a2a',
      hover: '#252525',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#666666',
    },
    border: {
      main: '#3a3a3a',
      light: '#2a2a2a',
      dark: '#4a4a4a',
    },
    action: {
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
  },
} as const;

export type ThemeMode = 'light' | 'dark';
