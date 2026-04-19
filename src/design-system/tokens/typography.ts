/**
 * Astro Enea Design System - Typography Tokens
 */

export const typography = {
  fontFamily: {
    serif: 'Instrument Serif, Georgia, serif',
    sans: 'System Font, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },

  fontSize: {
    displayLarge: 40,
    display: 32,
    h1: 28,
    h2: 24,
    bodyLarge: 18,
    body: 16,
    bodySmall: 14,
    labelLarge: 14,
    label: 14,
    caption: 14,
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    displayLarge: 48,
    display: 40,
    h1: 36,
    h2: 32,
    bodyLarge: 28,
    body: 24,
    bodySmall: 20,
    label: 21,
    caption: 21,
  },

  presets: {
    displayLarge: { fontSize: 40, fontWeight: '400' as const, lineHeight: 48 },
    display: { fontSize: 32, fontWeight: '400' as const, lineHeight: 40 },
    h1: { fontSize: 28, fontWeight: '400' as const, lineHeight: 36 },
    h2: { fontSize: 24, fontWeight: '400' as const, lineHeight: 32 },
    bodyLarge: { fontSize: 18, fontWeight: '400' as const, lineHeight: 28 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    labelLarge: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
    label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 21 },
    caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  },
};

export default typography;
