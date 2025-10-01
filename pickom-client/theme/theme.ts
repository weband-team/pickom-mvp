import { createTheme, Theme } from '@mui/material/styles';
import { colors, ThemeMode } from './colors';

export const createPickomTheme = (mode: ThemeMode): Theme => {
  const isDark = mode === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      secondary: {
        main: isDark ? themeColors.background.paper : '#000000',
        contrastText: isDark ? '#ffffff' : '#ffffff',
      },
      background: {
        default: themeColors.background.default,
        paper: themeColors.background.paper,
      },
      text: {
        primary: themeColors.text.primary,
        secondary: themeColors.text.secondary,
        disabled: themeColors.text.disabled,
      },
      divider: themeColors.border.main,
      action: {
        hover: themeColors.action.hover,
        selected: themeColors.action.selected,
        disabled: themeColors.action.disabled,
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
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
          },
          contained: {
            backgroundColor: colors.primary.main,
            color: '#000000',
            '&:hover': {
              backgroundColor: colors.primary.dark,
            },
            '&.Mui-selected, &[aria-pressed="true"]': {
              backgroundColor: isDark ? themeColors.background.elevated : '#ffffff',
              color: themeColors.text.primary,
              border: `1px solid ${themeColors.border.dark}`,
              '&:hover': {
                backgroundColor: themeColors.background.hover,
              },
            },
          },
          outlined: {
            border: `1px solid ${themeColors.border.main}`,
            color: themeColors.text.primary,
            '&:hover': {
              backgroundColor: themeColors.action.hover,
              border: `1px solid ${themeColors.border.dark}`,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: isDark ? themeColors.background.elevated : 'transparent',
              '& fieldset': {
                borderColor: themeColors.border.main,
              },
              '&:hover fieldset': {
                borderColor: themeColors.border.dark,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.primary.main,
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.avatar.main,
            color: '#ffffff',
            fontWeight: 600,
          },
        },
      },
      MuiRating: {
        styleOverrides: {
          root: {
            color: colors.primary.main,
            '& .MuiRating-iconEmpty': {
              color: themeColors.border.main,
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            color: colors.primary.main,
            '& .MuiSlider-track': {
              backgroundColor: colors.primary.main,
            },
            '& .MuiSlider-thumb': {
              backgroundColor: colors.primary.main,
              '&:hover': {
                boxShadow: `0px 0px 0px 8px ${colors.primary.main}26`,
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: themeColors.border.main,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: themeColors.border.dark,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
              borderWidth: 2,
            },
          },
        },
      },
    },
  });
};

// Export default light theme for backward compatibility
export const theme = createPickomTheme('light');