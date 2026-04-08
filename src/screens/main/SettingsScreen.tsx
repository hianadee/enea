import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNotifications } from '@/notifications/useNotifications';
import { useUserStore } from '../../store/userStore';
import { colors, typography, spacing } from '@/design-system/tokens';
import { Button, Card, Input } from '@/design-system/components';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, SPACING, DEFAULT_PALETTE, PLANET_PALETTES } from '@/constants/theme';
import { ENNEAGRAM_TYPES } from '@/constants/enneagram';
import {
  SpiritualTradition, LanguageStyle, EnergyType, LifeFocus, TonePreferences,
} from '@/types';
import { getSunSign, PLANET_SYMBOLS } from '@/utils/astroUtils';
import { NatalChartWheel } from '@/design-system/components/NatalChartWheel';

// ─── Tone preference data ─────────────────────────────────────────────────────

const SPIRITUAL_TRADITIONS: SpiritualTradition[] = [
  'Budista', 'Estoica', 'Cristiana', 'Hindú', 'Secular', 'Taoísta', 'Islámica', 'Judía',
];
const LANGUAGE_STYLES: { value: LanguageStyle; desc: string }[] = [
  { value: 'Poético',    desc: 'Lírico' },
  { value: 'Directo',    desc: 'Claro' },
  { value: 'Metafórico', desc: 'Imágenes' },
  { value: 'Científico', desc: 'Evidencia' },
];
const ENERGY_TYPES: EnergyType[] = ['Centrador', 'Motivador', 'Reflexivo', 'Elevador'];
const LIFE_FOCUSES: LifeFocus[]   = ['Carrera', 'Relaciones', 'Crecimiento interior', 'Salud', 'Creatividad'];

// ─── Custom toggle ────────────────────────────────────────────────────────────

interface ToggleProps {
  value: boolean;
  onToggle: () => void;
  accentColor: string;
}

const ENEAToggle: React.FC<ToggleProps> = ({ value, onToggle, accentColor }) => {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;
  const bgOpacity  = useRef(new Animated.Value(value ? 1  : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: value ? 20 : 0, tension: 180, friction: 12, useNativeDriver: true }),
      Animated.timing(bgOpacity,  { toValue: value ? 1  : 0, duration: 180, useNativeDriver: false }),
    ]).start();
  }, [value]);

  const bgColor = bgOpacity.interpolate({
    inputRange:  [0, 1],
    outputRange: [colors.border, accentColor + 'CC'],
  });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8} style={{ minHeight: 44, justifyContent: 'center' }}>
      <Animated.View style={[toggle.track, { backgroundColor: bgColor, borderColor: value ? accentColor + '60' : colors.border }]}>
        <Animated.View style={[toggle.thumb, { transform: [{ translateX }], backgroundColor: value ? '#fff' : colors.textMuted }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const toggle = StyleSheet.create({
  track: {
    width: 46,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

// ─── Reusable section header ──────────────────────────────────────────────────

const SectionHeader: React.FC<{ label: string }> = ({ label }) => {
  const { colors } = useTheme();
  return (
    <View style={section.row}>
      <Text style={[section.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={[section.line, { backgroundColor: colors.border }]} />
    </View>
  );
};

const section = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md, marginTop: SPACING.xl },
  label: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 },
  line:  { flex: 1, height: 1 },
});

// ─── Chip selector row ────────────────────────────────────────────────────────

interface ChipRowProps<T extends string> {
  items: { value: T; label?: string }[];
  selected: T | undefined;
  onSelect: (v: T) => void;
  accentColor: string;
}

function ChipRow<T extends string>({ items, selected, onSelect, accentColor }: ChipRowProps<T>) {
  const { colors } = useTheme();
  return (
    <View style={chip.row}>
      {items.map((item) => {
        const active = selected === item.value;
        return (
          <TouchableOpacity
            key={item.value}
            style={[
              chip.pill,
              { borderColor: active ? accentColor : colors.border, backgroundColor: active ? accentColor + '14' : colors.surface },
            ]}
            onPress={() => onSelect(item.value)}
            activeOpacity={0.7}
          >
            <Text style={[chip.text, { color: active ? accentColor : colors.textSecondary }]}>
              {item.label ?? item.value}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const chip = StyleSheet.create({
  row:  { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  pill: { paddingVertical: 6, paddingHorizontal: SPACING.md, borderRadius: 100, borderWidth: 1 },
  text: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500' },
});

// ─── Settings row (label + right element) ────────────────────────────────────

interface SettingsRowProps {
  label: string;
  right: React.ReactNode;
  sublabel?: string;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ label, right, sublabel }) => {
  const { colors } = useTheme();
  return (
    <View style={[row.container, { borderBottomColor: colors.border }]}>
      <View style={row.left}>
        <Text style={[row.label, { color: colors.text }]}>{label}</Text>
        {sublabel && <Text style={[row.sublabel, { color: colors.textMuted }]}>{sublabel}</Text>}
      </View>
      {right}
    </View>
  );
};

const row = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: 1 },
  left:      { flex: 1, gap: 2 },
  label:     { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '400' },
  sublabel:  { fontSize: TYPOGRAPHY.sizes.xs, letterSpacing: 0.2 },
});

// ─── Natal chart card ─────────────────────────────────────────────────────────

const NatalChartCard: React.FC = () => {
  const { colors } = useTheme();
  const { birthData, natalChart } = useOnboardingStore();
  const palette = natalChart?.dominantPlanet ? PLANET_PALETTES[natalChart.dominantPlanet] : DEFAULT_PALETTE;
  const sunSign  = getSunSign(birthData.date ?? '');

  const rows: { symbol: string; label: string; value: string }[] = [
    {
      symbol: '☉',
      label: 'Sol',
      value: sunSign ? `${sunSign.symbol} ${sunSign.name}` : (birthData.date ? '—' : 'Ingresa tu fecha de nacimiento'),
    },
    {
      symbol: '☽',
      label: 'Luna',
      value: natalChart?.moonSign ?? 'Requiere cálculo de carta natal',
    },
    {
      symbol: '↑',
      label: 'Ascendente',
      value: natalChart?.risingSign ?? 'Requiere hora y lugar de nacimiento',
    },
    {
      symbol: PLANET_SYMBOLS[natalChart?.dominantPlanet ?? 'Moon'] ?? '◉',
      label: 'Dominante',
      value: natalChart?.dominantPlanet ?? 'Luna (predeterminado)',
    },
  ];

  return (
    <View style={[natCard.container, { backgroundColor: colors.surface, borderColor: palette.primary + '30' }]}>
      {/* Chart wheel */}
      {birthData.date && (
        <View style={natCard.wheelRow}>
          <NatalChartWheel birthData={birthData} natalChart={natalChart} size={180} />
        </View>
      )}

      {rows.map((r) => (
        <View key={r.label} style={[natCard.row, { borderBottomColor: colors.border }]}>
          <Text style={[natCard.symbol, { color: palette.primary }]}>{r.symbol}</Text>
          <Text style={[natCard.rowLabel, { color: colors.textSecondary }]}>{r.label}</Text>
          <Text style={[natCard.value, { color: colors.text }]}>{r.value}</Text>
        </View>
      ))}
      {birthData.locationName && (
        <View style={natCard.birthRow}>
          <Text style={[natCard.birthText, { color: colors.textMuted }]}>
            {birthData.date}  ·  {birthData.time}  ·  {birthData.locationName}
          </Text>
        </View>
      )}
    </View>
  );
};

const natCard = StyleSheet.create({
  container: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  wheelRow:  { alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: '#2A2A3A' },
  row:       { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, gap: SPACING.md },
  symbol:    { fontSize: 18, width: 24, textAlign: 'center' },
  rowLabel:  { width: 60, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500' },
  value:     { flex: 1, fontSize: TYPOGRAPHY.sizes.sm },
  birthRow:  { padding: SPACING.md },
  birthText: { fontSize: TYPOGRAPHY.sizes.xs, letterSpacing: 0.3 },
});

// ─── Enneagram card ───────────────────────────────────────────────────────────

const EnneagramCard: React.FC = () => {
  const { colors } = useTheme();
  const { enneagramType } = useOnboardingStore();
  if (!enneagramType) return null;
  const info = ENNEAGRAM_TYPES[enneagramType];

  return (
    <View style={[ennCard.container, { backgroundColor: colors.surface, borderColor: '#FC818130' }]}>
      <Text style={[ennCard.number, { color: '#FC8181' }]}>{enneagramType}</Text>
      <View style={ennCard.text}>
        <Text style={[ennCard.name, { color: colors.text }]}>{info.name}</Text>
        <Text style={[ennCard.tagline, { color: colors.textSecondary }]}>{info.tagline}</Text>
      </View>
    </View>
  );
};

const ennCard = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: SPACING.md, gap: SPACING.md },
  number:    { fontSize: 40, fontWeight: '200', width: 48, textAlign: 'center' },
  text:      { flex: 1, gap: 2 },
  name:      { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '300' },
  tagline:   { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export const SettingsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { tonePreferences, setTonePreference } = useOnboardingStore();
  const { isDark: isDarkSetting, setIsDark } = useSettingsStore();
  const palette = { ...DEFAULT_PALETTE, primary: '#FC8181' };

  const {
    dailyQuote,
    permissionGranted,
    toggle:      toggleNotification,
    updateTime,
    openSettings: openNotifSettings,
  } = useNotifications();

  const [showTimePicker, setShowTimePicker] = useState(false);

  // Valor Date sincronizado con la hora guardada en el store
  const timePickerDate = (() => {
    const d = new Date();
    d.setHours(dailyQuote.hour, dailyQuote.minute, 0, 0);
    return d;
  })();

  const formattedTime = `${String(dailyQuote.hour).padStart(2, '0')}:${String(dailyQuote.minute).padStart(2, '0')}`;

  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFade, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configuración</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile ── */}
        <SectionHeader label="Perfil" />

        <NatalChartCard />

        <View style={{ height: SPACING.md }} />

        <EnneagramCard />

        {/* ── Voice & Tone ── */}
        <SectionHeader label="Voz y Tono" />

        <View style={styles.toneGroup}>
          <Text style={[styles.toneLabel, { color: colors.textSecondary }]}>Tradición espiritual</Text>
          <ChipRow<SpiritualTradition>
            items={SPIRITUAL_TRADITIONS.map((v) => ({ value: v }))}
            selected={tonePreferences.spiritualTradition}
            onSelect={(v) => setTonePreference('spiritualTradition', v)}
            accentColor={palette.primary}
          />
        </View>

        <View style={styles.toneGroup}>
          <Text style={[styles.toneLabel, { color: colors.textSecondary }]}>Estilo de lenguaje</Text>
          <ChipRow<LanguageStyle>
            items={LANGUAGE_STYLES.map((s) => ({ value: s.value, label: `${s.value} · ${s.desc}` }))}
            selected={tonePreferences.languageStyle}
            onSelect={(v) => setTonePreference('languageStyle', v)}
            accentColor={palette.primary}
          />
        </View>

        <View style={styles.toneGroup}>
          <Text style={[styles.toneLabel, { color: colors.textSecondary }]}>Energía</Text>
          <ChipRow<EnergyType>
            items={ENERGY_TYPES.map((v) => ({ value: v }))}
            selected={tonePreferences.energy}
            onSelect={(v) => setTonePreference('energy', v)}
            accentColor={palette.primary}
          />
        </View>

        <View style={styles.toneGroup}>
          <Text style={[styles.toneLabel, { color: colors.textSecondary }]}>Enfoque vital</Text>
          <ChipRow<LifeFocus>
            items={LIFE_FOCUSES.map((v) => ({ value: v }))}
            selected={tonePreferences.lifeFocus}
            onSelect={(v) => setTonePreference('lifeFocus', v)}
            accentColor={palette.primary}
          />
        </View>

        {/* ── Notifications ── */}
        <SectionHeader label="Notificaciones" />

        {/* Banner de permisos denegados */}
        {permissionGranted === false && (
          <View style={[notifStyles.banner, { backgroundColor: palette.primary + '18', borderColor: palette.primary + '40' }]}>
            <Text style={[notifStyles.bannerText, { color: colors.text }]}>
              Activa los permisos en Ajustes para recibir tus mensajes diarios
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openSettings()}
              style={[notifStyles.bannerBtn, { borderColor: palette.primary }]}
              activeOpacity={0.7}
            >
              <Text style={[notifStyles.bannerBtnText, { color: palette.primary }]}>Ir a Ajustes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Fila: Cita diaria — toggle + botón de hora */}
        <SettingsRow
          label="Cita diaria"
          sublabel={
            dailyQuote.enabled
              ? `${formattedTime} · Cada día`
              : 'Pausada'
          }
          right={
            <View style={notifStyles.rightGroup}>
              {/* Botón de hora */}
              <TouchableOpacity
                style={[
                  notifStyles.timeBtn,
                  { borderColor: dailyQuote.enabled ? palette.primary + '60' : colors.border },
                ]}
                onPress={() => setShowTimePicker(true)}
                disabled={!dailyQuote.enabled}
                activeOpacity={0.7}
                accessibilityLabel={`Cambiar hora de notificación, actualmente ${formattedTime}`}
                accessibilityRole="button"
              >
                <Text style={[
                  notifStyles.timeBtnText,
                  { color: dailyQuote.enabled ? palette.primary : colors.textMuted },
                ]}>
                  {formattedTime}
                </Text>
              </TouchableOpacity>

              {/* Toggle */}
              <ENEAToggle
                value={dailyQuote.enabled}
                onToggle={() => toggleNotification(!dailyQuote.enabled)}
                accentColor={palette.primary}
              />
            </View>
          }
        />

        {/* Time Picker — Modal para ambas plataformas */}
        <Modal
          visible={showTimePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <TouchableOpacity
            style={notifStyles.modalOverlay}
            onPress={() => setShowTimePicker(false)}
            activeOpacity={1}
          >
            <View
              style={[notifStyles.modalCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              onStartShouldSetResponder={() => true} // evita cerrar al tocar la card
            >
              {/* Header del picker */}
              <View style={notifStyles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Text style={[notifStyles.modalAction, { color: colors.textMuted }]}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={[notifStyles.modalTitle, { color: colors.text }]}>Hora del aviso</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Text style={[notifStyles.modalAction, { color: palette.primary, fontWeight: '600' }]}>Listo</Text>
                </TouchableOpacity>
              </View>

              {/* Picker */}
              <DateTimePicker
                value={timePickerDate}
                mode="time"
                is24Hour
                display="spinner"
                onChange={(_event, selectedDate) => {
                  if (!selectedDate) return;
                  updateTime(selectedDate.getHours(), selectedDate.getMinutes());
                  // En Android el picker se cierra solo; en iOS esperamos al botón Listo
                  if (Platform.OS === 'android') setShowTimePicker(false);
                }}
                style={notifStyles.picker}
                {...(Platform.OS === 'ios' && { textColor: colors.text })}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ── Appearance ── */}
        <SectionHeader label="Apariencia" />

        <SettingsRow
          label="Modo oscuro"
          sublabel={isDark ? 'Activado' : 'Modo claro activo'}
          right={
            <ENEAToggle
              value={isDarkSetting}
              onToggle={() => setIsDark(!isDarkSetting)}
              accentColor={palette.primary}
            />
          }
        />

        {/* ── About ── */}
        <SectionHeader label="Acerca de" />

        <SettingsRow
          label="Versión"
          right={<Text style={[styles.versionText, { color: colors.textMuted }]}>1.0.0</Text>}
        />
        <SettingsRow
          label="Hecho con"
          right={<Text style={[styles.versionText, { color: colors.textMuted }]}>Expo · React Native</Text>}
        />

        {/* Dev-only reset onboarding */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.devReset}
            onPress={() => {
              useUserStore.getState().setOnboardingCompleted(false);
              Alert.alert('Listo', 'Listo, reinicia la app para ver el onboarding');
            }}
            activeOpacity={0.6}
          >
            <Text style={styles.devResetText}>🔧 Reset onboarding (dev)</Text>
          </TouchableOpacity>
        )}

        {/* Ornament footer */}
        <View style={styles.footer}>
          <View style={[styles.footerDot, { backgroundColor: palette.primary + '50' }]} />
          <View style={[styles.footerLine, { backgroundColor: palette.primary + '20' }]} />
          <Text style={[styles.footerEnea, { color: palette.primary + '60' }]}>ENEA</Text>
          <View style={[styles.footerLine, { backgroundColor: palette.primary + '20' }]} />
          <View style={[styles.footerDot, { backgroundColor: palette.primary + '50' }]} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '300',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  toneGroup: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  toneLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  versionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING['2xl'],
    gap: SPACING.sm,
  },
  footerDot:  { width: 4, height: 4, borderRadius: 2 },
  footerLine: { width: 32, height: 1 },
  footerEnea:  { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '600', letterSpacing: 2 },
  devReset: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.xl,
  },
  devResetText: {
    color: '#FC8181',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
});

// ─── Notification-specific styles ─────────────────────────────────────────────

const notifStyles = StyleSheet.create({
  // Banner de permisos denegados
  banner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  bannerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
  bannerBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },

  // Fila derecha: botón de hora + toggle
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  timeBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    minWidth: 52,
    alignItems: 'center',
  },
  timeBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Modal del time picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingBottom: SPACING['2xl'],
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
  },
  modalAction: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  picker: {
    width: '100%',
  },
});
