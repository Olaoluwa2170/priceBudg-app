/**
 * Centralized color palette for the PriceIt app.
 * All hex/rgba values used across the project mapped to semantic names.
 */
export const colors = {
  // Base
  white: '#fff',
  black: '#000',

  // Grays - text & borders
  gray50: '#f9fafb',
  gray100: '#f0f0f0',
  gray200: '#e5e5e5',
  gray300: '#cfd2d4',
  gray400: '#ccc',
  gray500: '#6b7280',
  gray600: '#666',
  gray700: '#333',
  gray900: '#111827',
  placeholderGray: '#999',

  // Primary & accent
  primaryBlue: '#51a2ff',
  googleBlue: '#4285F4',
  tabInactive: '#90a1b9',

  // Success / premium
  success: '#22c55e',
  successBg: '#f0fdf4',

  // Error / danger
  error: '#dc2626',
  danger: '#ef4444',
  dangerDark: '#b91c1c',

  // Overlays
  overlayDark: 'rgba(0, 0, 0, 0.5)',
  overlayDarkLight: 'rgba(0, 0, 0, 0.3)',
  overlayWhite: 'rgba(255, 255, 255, 0.98)',
  overlayWhiteSoft: 'rgba(255, 255, 255, 0.95)',
  overlayWhiteMuted: 'rgba(255, 255, 255, 0.5)',

  // Misc
  shadow: '#000',
  transparent: 'transparent',
  cardBg: '#f8f9fa',
} as const;

export type Colors = typeof colors;
