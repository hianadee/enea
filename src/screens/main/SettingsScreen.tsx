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
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNotifications } from '@/notifications/useNotifications';
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
import { calculatePersonalYear, NUMEROLOGY_MEANINGS } from '@/utils/numerologyUtils';

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
      <View style={[section.line, { backgroundColor: ACCENT + '20' }]} />
    </View>
  );
};

const section = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 36 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', flexShrink: 0 },
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
      value: sunSign ? `${sunSign.symbol} ${sunSign.name}` : (birthData.date ? '—' : 'Añade tu fecha de nacimiento'),
    },
    {
      symbol: '☽',
      label: 'Luna',
      value: natalChart?.moonSign ?? 'Requiere carta natal',
    },
    {
      symbol: '↑',
      label: 'Asc',
      value: natalChart?.risingSign ?? 'Requiere hora y lugar',
    },
    {
      symbol: PLANET_SYMBOLS[natalChart?.dominantPlanet ?? 'Moon'] ?? '◉',
      label: 'Dom.',
      value: natalChart?.dominantPlanet ?? 'Luna',
    },
  ];

  return (
    <View style={natCard.container}>
      {/* Rueda natal */}
      {birthData.date && (
        <View style={natCard.wheelRow}>
          <NatalChartWheel birthData={birthData} natalChart={natalChart} size={160} />
        </View>
      )}

      {/* Filas de planetas */}
      {rows.map((r, i) => (
        <View
          key={r.label}
          style={[
            natCard.row,
            { borderBottomColor: ACCENT + '12' },
            i === rows.length - 1 && { borderBottomWidth: 0 },
          ]}
        >
          <Text style={[natCard.symbol, { color: palette.primary }]}>{r.symbol}</Text>
          <Text style={[natCard.rowLabel, { color: colors.textMuted }]}>{r.label}</Text>
          <Text style={[natCard.value, { color: colors.text }]}>{r.value}</Text>
        </View>
      ))}

      {/* Datos de nacimiento */}
      {(birthData.date || birthData.locationName) && (
        <View style={[natCard.birthRow, { borderTopColor: ACCENT + '12' }]}>
          <Text style={[natCard.birthText, { color: colors.textMuted }]}>
            {[birthData.date, birthData.time, birthData.locationName].filter(Boolean).join('  ·  ')}
          </Text>
        </View>
      )}
    </View>
  );
};

const natCard = StyleSheet.create({
  container: { overflow: 'hidden' },
  wheelRow:  { alignItems: 'center', paddingVertical: 16, marginBottom: 8 },
  row:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  symbol:    { fontSize: 17, width: 22, textAlign: 'center' },
  rowLabel:  { width: 36, fontSize: 12, fontWeight: '500', letterSpacing: 0.2 },
  value:     { flex: 1, fontSize: 14 },
  birthRow:  { paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 4 },
  birthText: { fontSize: 11, letterSpacing: 0.3, lineHeight: 18 },
});

// ─── Enneagram card ───────────────────────────────────────────────────────────

const EnneagramCard: React.FC = () => {
  const { colors } = useTheme();
  const { enneagramType } = useOnboardingStore();
  if (!enneagramType) return null;
  const info = ENNEAGRAM_TYPES[enneagramType];

  return (
    <View style={ennCard.container}>
      {/* Número grande — identidad tipográfica */}
      <Text style={[ennCard.number, { color: ACCENT }]}>{enneagramType}</Text>
      <View style={[ennCard.divider, { backgroundColor: ACCENT + '20' }]} />
      <View style={ennCard.text}>
        <Text style={[ennCard.name, { color: colors.text }]}>{info.name}</Text>
        <Text style={[ennCard.tagline, { color: colors.textMuted }]}>{info.tagline}</Text>
      </View>
    </View>
  );
};

const ennCard = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingVertical: 8 },
  number:    { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 56, fontWeight: '300', width: 52, textAlign: 'center', lineHeight: 60 },
  divider:   { width: 1, height: 44 },
  text:      { flex: 1, gap: 4 },
  name:      { fontSize: 17, fontWeight: '300', letterSpacing: 0.1 },
  tagline:   { fontSize: 13, lineHeight: 19, letterSpacing: 0.1 },
});

// ─── Numerology card ──────────────────────────────────────────────────────────

const NumerologyCard: React.FC = () => {
  const { colors } = useTheme();
  const { birthData, numerologyProfile } = useOnboardingStore();

  if (!numerologyProfile) return null;

  const lifePathMeaning     = NUMEROLOGY_MEANINGS[numerologyProfile.lifePath];
  const personalYear        = birthData?.date ? calculatePersonalYear(birthData.date) : null;
  const personalYearMeaning = personalYear ? NUMEROLOGY_MEANINGS[personalYear] : null;

  return (
    <View style={numCard.container}>
      {/* Camino de vida — permanente */}
      <View style={numCard.row}>
        <Text style={[numCard.number, { color: ACCENT }]}>{numerologyProfile.lifePath}</Text>
        <View style={[numCard.vline, { backgroundColor: ACCENT + '20' }]} />
        <View style={numCard.textCol}>
          <Text style={[numCard.rowTitle, { color: colors.text }]}>
            Camino de vida{lifePathMeaning ? `  ·  ${lifePathMeaning.titleShort}` : ''}
          </Text>
          {lifePathMeaning && (
            <Text style={[numCard.rowDesc, { color: colors.textMuted }]} numberOfLines={2}>
              {lifePathMeaning.description}
            </Text>
          )}
        </View>
      </View>

      {/* Hairline separador */}
      {personalYear && (
        <View style={[numCard.separator, { backgroundColor: ACCENT + '15' }]} />
      )}

      {/* Año Personal — se recalcula cada 1 de enero */}
      {personalYear && (
        <View style={numCard.row}>
          <Text style={[numCard.number, { color: ACCENT + 'BB' }]}>{personalYear}</Text>
          <View style={[numCard.vline, { backgroundColor: ACCENT + '20' }]} />
          <View style={numCard.textCol}>
            <Text style={[numCard.rowTitle, { color: colors.text }]}>
              Año Personal{personalYearMeaning ? `  ·  ${personalYearMeaning.titleShort}` : ''}
            </Text>
            {personalYearMeaning && (
              <Text style={[numCard.rowDesc, { color: colors.textMuted }]} numberOfLines={2}>
                {personalYearMeaning.description}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const numCard = StyleSheet.create({
  container:  { gap: 0 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 20, paddingVertical: 10 },
  number:     { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 40, fontWeight: '300', width: 40, textAlign: 'center', lineHeight: 44 },
  vline:      { width: 1, height: 36 },
  textCol:    { flex: 1, gap: 3 },
  rowTitle:   { fontSize: 14, fontWeight: '400', letterSpacing: 0.1 },
  rowDesc:    { fontSize: 12, lineHeight: 18, letterSpacing: 0.1 },
  separator:  { height: 1, marginVertical: 4 },
});

// ─── Constante tipográfica ────────────────────────────────────────────────────
const GEORGIA = Platform.OS === 'ios' ? 'Georgia' : 'serif';
const ACCENT   = '#FC8181';

// ─── Tab selector interno ─────────────────────────────────────────────────────

type InternalTab = 'chart' | 'ajustes';

interface InternalTabBarProps {
  active: InternalTab;
  onChange: (tab: InternalTab) => void;
}

const InternalTabBar: React.FC<InternalTabBarProps> = ({ active, onChange }) => {
  const { colors } = useTheme();
  return (
    <View style={[itab.container, { borderBottomColor: ACCENT + '18' }]}>
      {(['chart', 'ajustes'] as InternalTab[]).map((tab) => {
        const isActive = active === tab;
        const label = tab === 'chart' ? 'Chart' : 'Ajustes';
        return (
          <TouchableOpacity
            key={tab}
            style={itab.tab}
            onPress={() => onChange(tab)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[itab.label, { color: isActive ? ACCENT : colors.textMuted }]}>
              {label}
            </Text>
            {isActive && (
              <View style={[itab.indicator, { backgroundColor: ACCENT }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const itab = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: 1,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { firstName, tonePreferences, setTonePreference } = useOnboardingStore();
  const { isDark: isDarkSetting, setIsDark } = useSettingsStore();
  const palette = { ...DEFAULT_PALETTE, primary: ACCENT };

  const [activeTab, setActiveTab] = useState<InternalTab>('chart');

  const {
    dailyQuote,
    permissionGranted,
    toggle:      toggleNotification,
    updateTime,
  } = useNotifications();

  const [showTimePicker, setShowTimePicker] = useState(false);

  // ── Detección de cambios (dirty state) ────────────────────────────────────
  // Snapshot de los ajustes al entrar a la pantalla
  const snapshot = useRef({
    spiritualTradition: tonePreferences.spiritualTradition,
    languageStyle:      tonePreferences.languageStyle,
    energy:             tonePreferences.energy,
    lifeFocus:          tonePreferences.lifeFocus,
    isDark:             isDarkSetting,
    notifEnabled:       dailyQuote.enabled,
    notifHour:          dailyQuote.hour,
    notifMinute:        dailyQuote.minute,
  });

  const isDirty =
    tonePreferences.spiritualTradition !== snapshot.current.spiritualTradition ||
    tonePreferences.languageStyle      !== snapshot.current.languageStyle      ||
    tonePreferences.energy             !== snapshot.current.energy             ||
    tonePreferences.lifeFocus          !== snapshot.current.lifeFocus          ||
    isDarkSetting                      !== snapshot.current.isDark             ||
    dailyQuote.enabled                 !== snapshot.current.notifEnabled       ||
    dailyQuote.hour                    !== snapshot.current.notifHour          ||
    dailyQuote.minute                  !== snapshot.current.notifMinute;

  const handleDone = () => {
    // Actualizar snapshot para que isDirty vuelva a false
    snapshot.current = {
      spiritualTradition: tonePreferences.spiritualTradition,
      languageStyle:      tonePreferences.languageStyle,
      energy:             tonePreferences.energy,
      lifeFocus:          tonePreferences.lifeFocus,
      isDark:             isDarkSetting,
      notifEnabled:       dailyQuote.enabled,
      notifHour:          dailyQuote.hour,
      notifMinute:        dailyQuote.minute,
    };
    navigation.navigate('Today');
  };

  const timePickerDate = (() => {
    const d = new Date();
    d.setHours(dailyQuote.hour, dailyQuote.minute, 0, 0);
    return d;
  })();

  const formattedTime = `${String(dailyQuote.hour).padStart(2, '0')}:${String(dailyQuote.minute).padStart(2, '0')}`;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── BARRA SUPERIOR: nombre ──────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Animated.View style={[styles.topBarInner, { opacity: fadeAnim }]}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            {firstName ? firstName : 'Tú'}
          </Text>
        </Animated.View>
        <View style={[styles.pageHairline, { backgroundColor: ACCENT + '20' }]} />

        {/* ── TABS INTERNOS ──────────────────────────────────────────────── */}
        <InternalTabBar active={activeTab} onChange={setActiveTab} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        key={activeTab}
      >

        {/* ══════════════════════ TAB: CHART ══════════════════════════════ */}
        {activeTab === 'chart' && (
          <>
            <SectionHeader label="Carta natal" />
            <NatalChartCard />

            <View style={styles.cardGap} />

            <SectionHeader label="Eneagrama" />
            <EnneagramCard />

            <View style={styles.cardGap} />

            <SectionHeader label="Numerología" />
            <NumerologyCard />
          </>
        )}

        {/* ══════════════════════ TAB: AJUSTES ════════════════════════════ */}
        {activeTab === 'ajustes' && (
          <>
            {/* ── VOZ DE ENEA ─────────────────────────────────────────── */}
            <SectionHeader label="Voz de Enea" />
            <Text style={[styles.sectionIntro, { color: colors.textMuted }]}>
              Así habla Enea contigo. Puedes cambiarlo cuando quieras.
            </Text>

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

            {/* ── AVISOS ─────────────────────────────────────────────── */}
            <SectionHeader label="Avisos" />

            {permissionGranted === false && (
              <View style={[notifStyles.banner, { backgroundColor: ACCENT + '12', borderColor: ACCENT + '35' }]}>
                <Text style={[notifStyles.bannerText, { color: colors.text }]}>
                  Activa los permisos para recibir tu mensaje diario
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openSettings()}
                  style={[notifStyles.bannerBtn, { borderColor: ACCENT }]}
                  activeOpacity={0.7}
                >
                  <Text style={[notifStyles.bannerBtnText, { color: ACCENT }]}>Abrir ajustes del sistema</Text>
                </TouchableOpacity>
              </View>
            )}

            <SettingsRow
              label="Cita diaria"
              sublabel={dailyQuote.enabled ? `${formattedTime} · Cada día` : 'Pausada'}
              right={
                <View style={notifStyles.rightGroup}>
                  <TouchableOpacity
                    style={[notifStyles.timeBtn, { borderColor: dailyQuote.enabled ? ACCENT + '55' : colors.border }]}
                    onPress={() => setShowTimePicker(true)}
                    disabled={!dailyQuote.enabled}
                    activeOpacity={0.7}
                    accessibilityLabel={`Hora de notificación: ${formattedTime}`}
                    accessibilityRole="button"
                  >
                    <Text style={[notifStyles.timeBtnText, { color: dailyQuote.enabled ? ACCENT : colors.textMuted }]}>
                      {formattedTime}
                    </Text>
                  </TouchableOpacity>
                  <ENEAToggle
                    value={dailyQuote.enabled}
                    onToggle={() => toggleNotification(!dailyQuote.enabled)}
                    accentColor={palette.primary}
                  />
                </View>
              }
            />

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
                  onStartShouldSetResponder={() => true}
                >
                  <View style={notifStyles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                      <Text style={[notifStyles.modalAction, { color: colors.textMuted }]}>Cancelar</Text>
                    </TouchableOpacity>
                    <Text style={[notifStyles.modalTitle, { color: colors.text }]}>Hora del aviso</Text>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                      <Text style={[notifStyles.modalAction, { color: ACCENT, fontWeight: '600' }]}>Listo</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={timePickerDate}
                    mode="time"
                    is24Hour
                    display="spinner"
                    onChange={(_event, selectedDate) => {
                      if (!selectedDate) return;
                      updateTime(selectedDate.getHours(), selectedDate.getMinutes());
                      if (Platform.OS === 'android') setShowTimePicker(false);
                    }}
                    style={notifStyles.picker}
                    {...(Platform.OS === 'ios' && { textColor: colors.text })}
                  />
                </View>
              </TouchableOpacity>
            </Modal>

            {/* ── APARIENCIA ─────────────────────────────────────────── */}
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

            {/* ── ACERCA DE ──────────────────────────────────────────── */}
            <SectionHeader label="Acerca de" />

            <SettingsRow
              label="Versión"
              right={<Text style={[styles.metaText, { color: colors.textMuted }]}>1.0.0</Text>}
            />
            <SettingsRow
              label="Política de privacidad"
              right={
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://hianadee.github.io/enea/privacy-policy.html')}
                  activeOpacity={0.7}
                  accessibilityLabel="Abrir política de privacidad"
                  accessibilityRole="link"
                >
                  <Text style={[styles.linkText, { color: ACCENT }]}>Ver →</Text>
                </TouchableOpacity>
              }
            />
            <SettingsRow
              label="Soporte"
              right={
                <TouchableOpacity
                  onPress={() => Linking.openURL('mailto:hi@astroenea.com')}
                  activeOpacity={0.7}
                  accessibilityLabel="Enviar email de soporte"
                  accessibilityRole="link"
                >
                  <Text style={[styles.linkText, { color: ACCENT }]}>hi@astroenea.com →</Text>
                </TouchableOpacity>
              }
            />
          </>
        )}

        {/* Footer ornamental */}
        <View style={styles.footer}>
          <View style={[styles.footerDot, { backgroundColor: ACCENT + '40' }]} />
          <View style={[styles.footerLine, { backgroundColor: ACCENT + '18' }]} />
          <Text style={[styles.footerEnea, { color: ACCENT + '50' }]}>ENEA</Text>
          <View style={[styles.footerLine, { backgroundColor: ACCENT + '18' }]} />
          <View style={[styles.footerDot, { backgroundColor: ACCENT + '40' }]} />
        </View>

      </ScrollView>

      {/* ── TIRA HECHO: pegada sobre la tab bar, solo en Ajustes con cambios */}
      {activeTab === 'ajustes' && isDirty && (
        <Animated.View
          style={[
            styles.doneStrip,
            {
              bottom: Math.max(insets.bottom, 12) + 74,
              backgroundColor: colors.background,
              borderTopColor: ACCENT + '28',
            },
            { opacity: fadeAnim },
          ]}
        >
          <Text style={[styles.doneStripLabel, { color: colors.textMuted }]}>
            Cambios sin guardar
          </Text>
          <TouchableOpacity
            onPress={handleDone}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 16, right: 4 }}
            accessibilityLabel="Guardar cambios y volver a Hoy"
            accessibilityRole="button"
          >
            <Text style={[styles.doneBtnText, { color: ACCENT }]}>Hecho</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Barra superior fija ────────────────────────────────────────────────────
  topBar: {
    paddingHorizontal: 28,
  },
  topBarInner: {
    paddingBottom: 14,
  },
  pageTitle: {
    fontFamily: GEORGIA,
    fontSize: 44,
    fontWeight: '300',
    letterSpacing: -0.5,
    fontStyle: 'italic',
    lineHeight: 48,
  },
  pageHairline: {
    height: 1,
    marginBottom: 0,
  },

  // ── Tira "Hecho" pegada a la tab bar ──────────────────────────────────────
  doneStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  doneStripLabel: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  scroll: {
    paddingHorizontal: 28,
    paddingBottom: 48,
  },

  // ── Cards ──────────────────────────────────────────────────────────────────
  cardGap: { height: 12 },

  // ── Voz de Enea ────────────────────────────────────────────────────────────
  sectionIntro: {
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.1,
    marginTop: -4,
    marginBottom: 20,
  },
  toneGroup: {
    marginBottom: 20,
    gap: 8,
  },
  toneLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // ── Genéricos ──────────────────────────────────────────────────────────────
  metaText: { fontSize: 13 },
  linkText:  { fontSize: 13, fontWeight: '500' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    gap: 10,
  },
  footerDot:  { width: 3, height: 3, borderRadius: 2 },
  footerLine: { width: 28, height: 1 },
  footerEnea: { fontSize: 10, fontWeight: '600', letterSpacing: 2 },

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
