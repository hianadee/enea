import { Platform } from 'react-native';
import { DominantPlanet } from '@/types';

export const PLANET_PALETTES: Record<DominantPlanet, { primary: string; secondary: string; accent: string }> = {
  Sun: { primary: '#F4C542', secondary: '#F97316', accent: '#FEF3C7' },
  Moon: { primary: '#C4B5FD', secondary: '#7C3AED', accent: '#EDE9FE' },
  Mercury: { primary: '#6EE7B7', secondary: '#059669', accent: '#ECFDF5' },
  Venus: { primary: '#FDA4AF', secondary: '#E11D48', accent: '#FFF1F2' },
  Mars: { primary: '#FC8181', secondary: '#DC2626', accent: '#FEF2F2' },
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
    textMuted: '#7D7C8F',   // ramp: textSecondary #8B8A9E → textMuted #7D7C8F → border #2A2A3A · 4.85:1 WCAG AA
  },
  light: {
    background:      '#EDEAF6',   // base: gris-lavanda suave — claramente no blanco
    surface:         '#F5F3FD',   // tarjetas: ligeramente más claro que el fondo
    surfaceElevated: '#FFFFFF',   // modales y pickers: blanco puro — visiblemente elevado
    border:          '#C8C5DC',   // bordes y separadores visibles
    text:            '#16162A',   // texto principal: casi negro con tinte morado
    textSecondary:   '#48465E',   // secundario: gris-morado oscuro — buena legibilidad
    textMuted:       '#6E6C82',   // auxiliar: visible sobre todos los fondos (~4.5:1)
  },
};

// ─── Font families ────────────────────────────────────────────────────────────
export const FONT_FAMILY = {
  /** Georgia (iOS) / serif genérico (Android) — editorial, poético */
  serif: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  /** Sistema — sans-serif por defecto (undefined = hereda el sistema) */
  sans:  undefined as string | undefined,
};

// ─── Escala tipográfica jerárquica ────────────────────────────────────────────
//
// JERARQUÍA (de mayor a menor énfasis):
//   display → heading1 → heading2 → heading3
//   quote → sectionTitle
//   title → subtitle
//   bodyLg → bodyLgStrong → body → bodySm → bodySmMedium
//   caption → captionItalic
//   label → badge → micro
//   button · tab
//
// USO en StyleSheet.create():
//   someStyle: { ...TYPOGRAPHY.presets.bodyLg }
// USO con color dinámico en JSX:
//   style={[styles.someStyle, { color: colors.text }]}
// ─────────────────────────────────────────────────────────────────────────────

const _serif = Platform.OS === 'ios' ? 'Georgia' : ('serif' as string);

export const TYPOGRAPHY = {
  // ── Raw sizes — compatibilidad con código existente ───────────────────────
  sizes: {
    xs: 14,
    sm: 14,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // ── Presets semánticos ────────────────────────────────────────────────────
  presets: {

    // ── Nivel 1: Display ─────────────────────────────────────────────────
    /** Números héroe — eneagrama (96px), numerología (120px) */
    display: {
      fontFamily: _serif,
      fontSize: 96,
      fontWeight: '200' as const,
      lineHeight: 104,
      letterSpacing: -4,
    },

    // ── Nivel 2: Headings (serif, light) ─────────────────────────────────
    /** Título principal de pantalla — nombre, carta natal, perfil */
    heading1: {
      fontFamily: _serif,
      fontSize: 40,
      fontWeight: '300' as const,
      lineHeight: 48,
      letterSpacing: -0.5,
    },
    /** Sección editorial destacada — pregunta eneagrama, intro */
    heading2: {
      fontFamily: _serif,
      fontSize: 30,
      fontWeight: '300' as const,
      lineHeight: 40,
      letterSpacing: -0.3,
    },
    /** Título terciario — frase larga, quote del historial */
    heading3: {
      fontFamily: _serif,
      fontSize: 24,
      fontWeight: '300' as const,
      lineHeight: 36,
      letterSpacing: -0.2,
    },

    // ── Nivel 3: Elementos editoriales (serif) ────────────────────────────
    /** Frase diaria — elemento héroe de la pantalla Hoy */
    quote: {
      fontFamily: _serif,
      fontSize: 26,
      fontStyle: 'italic' as const,
      fontWeight: '400' as const,
      lineHeight: 44,
      letterSpacing: -0.3,
    },
    /** Etiqueta de sección — "Por qué esta frase hoy", "Numerología de hoy" */
    sectionTitle: {
      fontFamily: _serif,
      fontSize: 14,
      fontStyle: 'italic' as const,
      fontWeight: '400' as const,
      lineHeight: 22,
      letterSpacing: 0.1,
    },

    // ── Nivel 4: Títulos de tarjeta (sans) ───────────────────────────────
    /** Nombre de arquetipo, título de tarjeta */
    title: {
      fontSize: 20,
      fontWeight: '400' as const,
      lineHeight: 28,
      letterSpacing: 0.1,
    },
    /** Énfasis medio — "Desafío del X", shadowLabel */
    subtitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 26,
      letterSpacing: 0.2,
    },

    // ── Nivel 5: Cuerpo (sans) ────────────────────────────────────────────
    /** Cuerpo principal — explicaciones, contexto, párrafos */
    bodyLg: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 26,
      letterSpacing: 0.1,
    },
    /** Cuerpo con énfasis — frases de tarjeta numerológica */
    bodyLgStrong: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
      letterSpacing: 0.1,
    },
    /** Cuerpo estándar — opciones, descripciones generales */
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 24,
      letterSpacing: 0.1,
    },
    /** Cuerpo pequeño — sublabels, metadata, fechas */
    bodySm: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 22,
      letterSpacing: 0.1,
    },
    /** Cuerpo pequeño con énfasis — tipo tag, explicación corta */
    bodySmMedium: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 22,
      letterSpacing: 0.3,
    },

    // ── Nivel 6: Auxiliares (sans) ────────────────────────────────────────
    /** Texto auxiliar — hints contextuales, "qué es" */
    caption: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 19,
      letterSpacing: 0.1,
    },
    /** Caption en cursiva — hints de tarjeta numerológica */
    captionItalic: {
      fontSize: 13,
      fontStyle: 'italic' as const,
      fontWeight: '400' as const,
      lineHeight: 19,
      letterSpacing: 0.1,
    },

    // ── Nivel 7: Microcopia (sans, uppercase) ─────────────────────────────
    /** Etiqueta uppercase — DÍA UNIVERSAL, AÑO PERSONAL, TUS ASTROS, cardLabel */
    label: {
      fontSize: 11,
      fontWeight: '600' as const,
      lineHeight: 16,
      letterSpacing: 1.8,
      textTransform: 'uppercase' as const,
    },
    /** Texto de badge / pill */
    badge: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 18,
      letterSpacing: 0.3,
    },
    /** Microcopia — action labels (Guardado, Compartir), textos auxiliares */
    micro: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 18,
      letterSpacing: 0.3,
    },

    // ── Especiales ────────────────────────────────────────────────────────
    /** CTA primario — todos los botones principales */
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
      letterSpacing: 0.3,
    },
    /** Label de tab bar */
    tab: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
      letterSpacing: 0.4,
    },
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
