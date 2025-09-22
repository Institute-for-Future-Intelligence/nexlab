// src/config/designSystem.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';

// Modern color palette
export const colors = {
  // Primary colors
  primary: {
    50: '#F0F4FF',
    100: '#E0ECFF', 
    200: '#CDDAFF',
    300: '#9BB5FF',
    400: '#6B8FFF',
    500: '#0B53C0', // Main brand color
    600: '#0841A0',
    700: '#062F80',
    800: '#041D60',
    900: '#020B40',
  },
  
  // Secondary colors
  secondary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  // Neutral colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    elevated: '#FFFFFF',
  },
  
  // Surface colors
  surface: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    elevated: '#FFFFFF',
  },
  
  // Text colors
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#64748B',
    disabled: '#94A3B8',
    inverse: '#FFFFFF',
  },
} as const;

// Typography system
export const typography = {
  fontFamily: {
    primary: ['Inter', 'system-ui', 'sans-serif'].join(','),
    secondary: ['Gabarito', 'system-ui', 'sans-serif'].join(','),
    display: ['Staatliches', 'system-ui', 'sans-serif'].join(','),
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

// Spacing system
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

// Border radius system
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// Shadow system
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// Animation system
export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  transitions: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Component-specific design tokens
export const components = {
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    shadow: shadows.md,
    hoverShadow: shadows.lg,
  },
  
  button: {
    borderRadius: borderRadius.xl, // More rounded corners
    padding: `${spacing[3]} ${spacing[6]}`,
    fontWeight: typography.fontWeight.semibold,
    transition: animations.transitions.fast,
  },
  
  input: {
    borderRadius: borderRadius.lg,
    padding: `${spacing[3]} ${spacing[4]}`,
    border: `1px solid ${colors.neutral[300]}`,
    focusBorder: `2px solid ${colors.primary[500]}`,
  },
  
  sidebar: {
    width: '320px',
    minWidth: '320px',
    maxWidth: '320px',
    backgroundColor: colors.background.secondary,
    borderRight: `1px solid ${colors.neutral[200]}`,
  },
} as const;

// Export individual component values for easier access
export const sidebarStyles = {
  width: '320px',
  minWidth: '320px',
  maxWidth: '320px',
  backgroundColor: colors.background.secondary,
  borderRight: `1px solid ${colors.neutral[200]}`,
};

// Design system loaded successfully

// Create MUI theme
export const createDesignSystemTheme = (): ThemeOptions => ({
  palette: {
    primary: {
      main: colors.primary[500],
      light: colors.primary[300],
      dark: colors.primary[700],
      contrastText: colors.text.inverse,
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[300],
      dark: colors.secondary[700],
      contrastText: colors.text.inverse,
    },
    error: {
      main: colors.error,
      light: '#FEE2E2',
      dark: '#DC2626',
    },
    warning: {
      main: colors.warning,
      light: '#FEF3C7',
      dark: '#D97706',
    },
    info: {
      main: colors.info,
      light: '#DBEAFE',
      dark: '#2563EB',
    },
    success: {
      main: colors.success,
      light: '#D1FAE5',
      dark: '#059669',
    },
    background: {
      default: colors.background.primary,
      paper: colors.surface.primary,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
    grey: {
      50: colors.neutral[50],
      100: colors.neutral[100],
      200: colors.neutral[200],
      300: colors.neutral[300],
      400: colors.neutral[400],
      500: colors.neutral[500],
      600: colors.neutral[600],
      700: colors.neutral[700],
      800: colors.neutral[800],
      900: colors.neutral[900],
    },
  },
  
  typography: {
    fontFamily: typography.fontFamily.primary,
    h1: {
      fontFamily: typography.fontFamily.display,
      fontSize: typography.fontSize['5xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
      color: colors.text.primary,
    },
    h2: {
      fontFamily: typography.fontFamily.display,
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
      color: colors.text.primary,
    },
    h3: {
      fontFamily: typography.fontFamily.display,
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.snug,
      color: colors.text.primary,
    },
    h4: {
      fontFamily: typography.fontFamily.display,
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
      color: colors.text.primary,
    },
    h5: {
      fontFamily: typography.fontFamily.secondary,
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.primary,
    },
    h6: {
      fontFamily: typography.fontFamily.secondary,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.primary,
    },
    body1: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.primary,
    },
    body2: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.secondary,
    },
    button: {
      fontFamily: typography.fontFamily.secondary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      textTransform: 'none',
    },
  },
  
  shape: {
    borderRadius: 12, // More rounded corners (12px)
  },
  
  shadows: [
    'none',
    shadows.sm,
    shadows.base,
    shadows.md,
    shadows.lg,
    shadows.xl,
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
  ],
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xl, // More rounded corners
          padding: `${spacing[3]} ${spacing[6]}`,
          fontWeight: typography.fontWeight.semibold,
          textTransform: 'none',
          transition: animations.transitions.fast,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: shadows.md,
            transform: 'none !important', // Override any scaling from CSS
          },
        },
        contained: {
          backgroundColor: colors.primary[500],
          '&:hover': {
            backgroundColor: colors.primary[600],
          },
        },
        outlined: {
          borderColor: colors.primary[500],
          color: colors.primary[500],
          '&:hover': {
            backgroundColor: colors.primary[50],
            borderColor: colors.primary[600],
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          boxShadow: shadows.md,
          border: `1px solid ${colors.neutral[200]}`,
          transition: animations.transitions.fast,
          '&:hover': {
            boxShadow: shadows.lg,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.lg,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary[300],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary[500],
              borderWidth: 2,
            },
          },
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.full,
          fontWeight: typography.fontWeight.medium,
        },
      },
    },
    
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.secondary,
          borderRadius: borderRadius.lg,
          padding: spacing[2],
          '& .MuiTabs-indicator': {
            display: 'none',
          },
        },
      },
    },
    
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          fontWeight: typography.fontWeight.semibold,
          textTransform: 'none',
          transition: animations.transitions.fast,
          '&.Mui-selected': {
            backgroundColor: colors.primary[500],
            color: colors.text.inverse,
            boxShadow: shadows.sm,
          },
          '&:not(.Mui-selected)': {
            backgroundColor: colors.primary[100],
            color: colors.primary[700],
            '&:hover': {
              backgroundColor: colors.primary[200],
              transform: 'none',
            },
          },
        },
      },
    },
  },
});

// Create the theme instance
const themeOptions = createDesignSystemTheme();
export const designSystemTheme = createTheme(themeOptions);

// Export the theme options for direct access
export { themeOptions as designSystem };
