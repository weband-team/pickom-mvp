// Theme constants for consistent styling across components
export const theme = {
  colors: {
    primary: '#f57c00',
    primaryHover: '#ef6c00',
    primaryActive: '#e65100',
    border: '#e0e0e0',
    borderHover: '#a0a0a0',
    borderLight: '#d0d0d0',
    backgroundHover: 'rgba(0,0,0,0.04)',
    textPrimary: '#000000',
    textSecondary: '#666666',
    white: '#ffffff',
  },

  spacing: {
    xs: '0.5rem',  // 8px
    sm: '1rem',    // 16px
    md: '1.5rem',  // 24px
    lg: '2rem',    // 32px
    xl: '3rem',    // 48px
  },

  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },

  shadows: {
    subtle: '0 1px 3px rgba(0,0,0,0.12)',
    medium: '0 4px 6px rgba(0,0,0,0.07)',
    strong: '0 10px 15px rgba(0,0,0,0.1)',
  },

  typography: {
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
} as const;

// Common MUI sx props for consistent styling
export const buttonStyles = {
  primary: {
    bgcolor: theme.colors.primary,
    '&:hover': { bgcolor: theme.colors.primaryHover },
    '&:active': { bgcolor: theme.colors.primaryActive },
    textTransform: 'none',
    fontWeight: theme.typography.fontWeight.medium,
  },

  outlined: {
    borderColor: theme.colors.borderLight,
    color: 'text.primary',
    '&:hover': {
      borderColor: theme.colors.borderHover,
      bgcolor: theme.colors.backgroundHover,
    },
    textTransform: 'none',
    fontWeight: theme.typography.fontWeight.medium,
  },
} as const;

export const cardStyles = {
  base: {
    p: 2,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.white,
  },

  hover: {
    '&:hover': {
      boxShadow: theme.shadows.medium,
    },
  },
} as const;