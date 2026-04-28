/**
 * TypographyPreviewScreen — solo visible en __DEV__
 * Referencia visual del sistema tipográfico de Astro Enea.
 * Muestra todos los TYPOGRAPHY.presets + paleta de colores + escala de spacing.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TYPOGRAPHY, FONT_FAMILY, COLORS, SPACING, PLANET_PALETTES } from '@/constants/theme';

const ACCENT = '#FC8181';
const BG     = '#08080D';
const SURFACE = '#111118';
const BORDER  = '#1E1E2A';

// ─── Datos de cada preset ─────────────────────────────────────────────────────

type PresetEntry = {
  key: string;
  label: string;
  sample: string;
  tag: string;
};

const PRESETS: PresetEntry[] = [
  { key: 'display',       label: 'display',       tag: '96 · serif · 200',     sample: '4' },
  { key: 'heading1',      label: 'heading1',       tag: '40 · serif · 300',     sample: 'Tu carta natal' },
  { key: 'heading2',      label: 'heading2',       tag: '30 · serif · 300',     sample: 'Tu camino tiene\nsu propio idioma.' },
  { key: 'heading3',      label: 'heading3',       tag: '24 · serif · 300',     sample: 'Voz de Enea' },
  { key: 'quote',         label: 'quote',          tag: '26 · serif · italic',  sample: '"Lo que resistes, persiste."' },
  { key: 'sectionTitle',  label: 'sectionTitle',   tag: '14 · serif · italic',  sample: 'Por qué esta frase hoy' },
  { key: 'title',         label: 'title',          tag: '20 · sans · 300',      sample: 'El Iniciador' },
  { key: 'subtitle',      label: 'subtitle',       tag: '18 · sans · 700',      sample: 'Desafío del 1' },
  { key: 'bodyLg',        label: 'bodyLg',         tag: '16 · sans · 400',      sample: 'El cielo exacto del momento en que naciste.' },
  { key: 'bodyLgStrong',  label: 'bodyLgStrong',   tag: '16 · sans · 600',      sample: 'El 1 vibra con la energía del origen.' },
  { key: 'body',          label: 'body',           tag: '15 · sans · 400',      sample: 'Cita diaria · Cada día · 08:00' },
  { key: 'bodySm',        label: 'bodySm',         tag: '14 · sans · 400',      sample: '1990-03-15 · 14:30 · Madrid, España' },
  { key: 'bodySmMedium',  label: 'bodySmMedium',   tag: '14 · sans · 500',      sample: 'Piscis · Taurus · Virgo' },
  { key: 'caption',       label: 'caption',        tag: '13 · sans · 400',      sample: 'Pasión: envidia · Fijación: melancolía' },
  { key: 'captionItalic', label: 'captionItalic',  tag: '13 · sans · italic',   sample: 'Tu momento astral más importante del día' },
  { key: 'label',         label: 'label',          tag: '11 · sans · 600 · UC · ls 1.8', sample: 'DÍA UNIVERSAL' },
  { key: 'badge',         label: 'badge',          tag: '12 · sans · 500',               sample: 'Meditativo · Poético' },
  { key: 'micro',         label: 'micro',          tag: '12 · sans · 500',               sample: 'Guardado · Compartir' },
  { key: 'button',        label: 'button',         tag: '16 · sans · 600',      sample: 'Continuar' },
  { key: 'tab',           label: 'tab',            tag: '14 · sans · 500',      sample: 'Hoy · Diario · Tú' },
];

// ─── Colores ──────────────────────────────────────────────────────────────────

const COLOR_TOKENS = Object.entries(COLORS.dark).map(([key, value]) => ({ key, value }));

const PLANET_TOKENS = Object.entries(PLANET_PALETTES).map(([planet, palette]) => ({
  planet,
  primary: palette.primary,
  secondary: palette.secondary,
}));

// ─── Spacing ──────────────────────────────────────────────────────────────────

const SPACING_TOKENS = Object.entries(SPACING).map(([key, value]) => ({ key, value }));

// ─── Componentes internos ─────────────────────────────────────────────────────

const SectionTitle: React.FC<{ label: string; color?: string }> = ({ label, color = ACCENT }) => (
  <View style={sec.row}>
    <View style={[sec.dot, { backgroundColor: color }]} />
    <Text style={[sec.text, { color }]}>{label.toUpperCase()}</Text>
  </View>
);
const sec = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  dot:  { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8 },
});

const Divider: React.FC = () => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: BORDER, marginVertical: 32 }} />;

// ─── Pantalla principal ───────────────────────────────────────────────────────

export const TypographyPreviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets     = useSafeAreaInsets();
  const [tab, setTab] = useState<'type' | 'color' | 'spacing'>('type');

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.devBadge}><Text style={s.devBadgeText}>DEV</Text></View>
          <Text style={s.headerTitle}>Design System</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {(['type', 'color', 'spacing'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tabBtn, tab === t && s.tabBtnActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabBtnText, tab === t && s.tabBtnTextActive]}>
              {t === 'type' ? 'Tipografía' : t === 'color' ? 'Colores' : 'Spacing'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido */}
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── TIPOGRAFÍA ───────────────────────────────────────────────────── */}
        {tab === 'type' && (
          <>
            {/* Leyenda */}
            <View style={s.legend}>
              <Text style={s.legendText}>
                serif = Georgia (iOS) / serif (Android){'  '}·{'  '}UC = uppercase
              </Text>
            </View>

            {PRESETS.map((p, i) => {
              const preset = TYPOGRAPHY.presets[p.key as keyof typeof TYPOGRAPHY.presets];
              return (
                <View key={p.key} style={[s.presetRow, i < PRESETS.length - 1 && s.presetRowBorder]}>
                  {/* Etiqueta + metadata */}
                  <View style={s.presetMeta}>
                    <Text style={s.presetKey}>{p.label}</Text>
                    <Text style={s.presetTag}>{p.tag}</Text>
                  </View>
                  {/* Muestra del texto */}
                  <Text style={[preset as any, s.presetSample]} numberOfLines={3}>
                    {p.sample}
                  </Text>
                </View>
              );
            })}
          </>
        )}

        {/* ── COLORES ──────────────────────────────────────────────────────── */}
        {tab === 'color' && (
          <>
            <SectionTitle label="Dark mode tokens" color="#8B8A9E" />

            {COLOR_TOKENS.map(({ key, value }) => (
              <View key={key} style={s.colorRow}>
                <View style={[s.colorSwatch, { backgroundColor: value }]} />
                <View style={s.colorInfo}>
                  <Text style={s.colorKey}>{key}</Text>
                  <Text style={s.colorValue}>{value}</Text>
                </View>
              </View>
            ))}

            <Divider />

            <SectionTitle label="Planeta · Accent primario" color="#8B8A9E" />

            {PLANET_TOKENS.map(({ planet, primary, secondary }) => (
              <View key={planet} style={s.colorRow}>
                <View style={[s.colorSwatch, { backgroundColor: primary }]} />
                <View style={s.colorInfo}>
                  <Text style={s.colorKey}>{planet}</Text>
                  <Text style={s.colorValue}>{primary}  ·  {secondary}</Text>
                </View>
              </View>
            ))}

            <Divider />

            <SectionTitle label="Acento global" color={ACCENT} />
            <View style={s.colorRow}>
              <View style={[s.colorSwatch, { backgroundColor: ACCENT }]} />
              <View style={s.colorInfo}>
                <Text style={s.colorKey}>Coral (ACCENT)</Text>
                <Text style={s.colorValue}>{ACCENT}  ·  toggles · chips activos · CTA</Text>
              </View>
            </View>
          </>
        )}

        {/* ── SPACING ──────────────────────────────────────────────────────── */}
        {tab === 'spacing' && (
          <>
            <SectionTitle label="Escala de espaciado" color="#8B8A9E" />

            {SPACING_TOKENS.map(({ key, value }) => (
              <View key={key} style={s.spacingRow}>
                <Text style={s.spacingKey}>{key}</Text>
                <Text style={s.spacingValue}>{value}px</Text>
                <View style={[s.spacingBar, { width: value }]} />
              </View>
            ))}
          </>
        )}

      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { color: '#FFFFFF', fontSize: 22 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 4 },
  headerTitle: { fontFamily: FONT_FAMILY.serif, fontSize: 20, color: '#FFFFFF', fontWeight: '300' },
  devBadge: {
    backgroundColor: ACCENT + '22',
    borderWidth: 1,
    borderColor: ACCENT + '55',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  devBadgeText: { fontSize: 9, fontWeight: '700', color: ACCENT, letterSpacing: 2 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: ACCENT },
  tabBtnText: { fontSize: 13, color: '#666680', fontWeight: '500' },
  tabBtnTextActive: { color: ACCENT },

  // Scroll
  scroll: { paddingHorizontal: 20, paddingTop: 24, gap: 0 },

  // Leyenda
  legend: {
    backgroundColor: SURFACE,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  legendText: { fontSize: 11, color: '#555570', letterSpacing: 0.2 },

  // Preset row
  presetRow: {
    paddingVertical: 16,
    gap: 8,
  },
  presetRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  presetMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  presetKey:  { fontSize: 11, fontWeight: '700', color: ACCENT, letterSpacing: 0.5, width: 110 },
  presetTag:  { fontSize: 11, color: '#444460', letterSpacing: 0.1 },
  presetSample: { color: '#F0EEF6' },

  // Color row
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  colorSwatch: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#FFFFFF10' },
  colorInfo:   { flex: 1, gap: 2 },
  colorKey:    { fontSize: 13, color: '#F0EEF6', fontWeight: '500' },
  colorValue:  { fontSize: 11, color: '#555570', letterSpacing: 0.2 },

  // Spacing row
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  spacingKey:   { fontSize: 13, color: ACCENT, fontWeight: '600', width: 36 },
  spacingValue: { fontSize: 12, color: '#555570', width: 40 },
  spacingBar:   { height: 8, backgroundColor: ACCENT + '40', borderRadius: 4, borderWidth: 1, borderColor: ACCENT + '60' },
});
