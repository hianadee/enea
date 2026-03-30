import { DominantPlanet } from '../types';

export const PLANET_PALETTES: Record<DominantPlanet, { primary: string; secondary: string; accent: string }> = {
  Sun: { primary: '#F4C542', secondary: '#F97316', accent: '#FEF3C7' },
  Moon: { primary: '#C4B5FD', secondary: '#7C3AED', accent: '#EDE9FE' },
  Mercury: { primary: '#6EE7B7', secondary: '#059669', accent: '#ECFDF5' },
  Venus: { primary: '#FDA4AF', secondary: '#E11D48', accent: '#FFF1F2' },
  Mars: { primary: '#FCA5A5', secondary: '#DC2626', accent: '#FEF2F2' },
  Jupiter: { primary: '#93C5FD', secondary: '#2563EB', accent: '#EFF6FF' },
  Saturn: { primary: '#FCD34D', secondary: '#1E3A5F', accent: '#1E293B' },
  Uranus: { primary: '#67E8F9', secondary: '#0891B2', accent: '#ECFEFF' },
  Neptune: { primary: '#A5B4FC', secondary: '#4338CA', accent: '#EEF2FF' },
  Pluto: { primary: '#D8B4FE', secondary: '#7E22CE', accent: '#F5F3FF' },
};

export const DEFAULT_PALETTE = PLANET_PALETTES.Moon;

export const COLORS = {
  dark: {
    background: '#0A0A0F',
    surface: '#13131A',
    surfaceElevated: '#1C1C26',
    border: '#2A2A3A',
    text: '#F0EEF6',
    textSecondary: '#8B8A9E',
    textMuted: '#4A4A5E',
  },
  light: {
    background: '#FAFAF8',
    surface: '#FFFFFF',
    surfaceElevated: '#F5F3FF',
    border: '#E8E6F0',
    text: '#1A1A2E',
    textSecondary: '#5C5A70',
    textMuted: '#A8A6B8',
  },
};

export const TYPOGRAPHY = {
  quoteFont: 'serif',
  bodyFont: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};
