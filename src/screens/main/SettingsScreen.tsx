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
import { useOnboardingStore } from '@/store/onboardingStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, FONT_FAMILY, SPACING, DEFAULT_PALETTE, PLANET_PALETTES } from '@/constants/theme';
import { ENNEAGRAM_TYPES } from '@/constants/enneagram';
import {
  SpiritualTradition, LanguageStyle, EnergyType, LifeFocus,
} from '@/types';
import { getSunSign, PLANET_SYMBOLS, ZODIAC_SIGNS } from '@/utils/astroUtils';
import { NatalChartWheel } from '@/design-system/components/NatalChartWheel';
import { calculatePersonalYear, NUMEROLOGY_MEANINGS } from '@/utils/numerologyUtils';

// ─── Constante de acento ─────────────────────────────────────────────────────
const ACCENT = '#FC8181';

// ─── Datos de tono ────────────────────────────────────────────────────────────
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

// ─── Toggle ───────────────────────────────────────────────────────────────────
const ENEAToggle: React.FC<{
  value: boolean;
  onToggle: () => void;
  accentColor: string;
  accessibilityLabel?: string;
}> = ({ value, onToggle, accentColor, accessibilityLabel }) => {
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
    outputRange: [colors.border, accentColor],
  });

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={{ minHeight: 44, justifyContent: 'center' }}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
    >
      <Animated.View style={[tog.track, { backgroundColor: bgColor, borderColor: value ? accentColor + '60' : colors.border }]}>
        <Animated.View style={[tog.thumb, { transform: [{ translateX }], backgroundColor: value ? '#fff' : colors.textMuted }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const tog = StyleSheet.create({
  track: { width: 46, height: 26, borderRadius: 13, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 3 },
  thumb: { width: 20, height: 20, borderRadius: 10 },
});

// ─── Chip row ─────────────────────────────────────────────────────────────────
function ChipRow<T extends string>({
  items, selected, onSelect, accentColor,
}: {
  items: { value: T; label?: string }[];
  selected: T | undefined;
  onSelect: (v: T) => void;
  accentColor: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={chip.row} accessibilityRole="radiogroup">
      {items.map((item) => {
        const active = selected === item.value;
        return (
          <TouchableOpacity
            key={item.value}
            style={[chip.pill, { borderColor: active ? accentColor : colors.border, backgroundColor: active ? accentColor + '14' : 'transparent' }]}
            onPress={() => onSelect(item.value)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityLabel={item.label ?? item.value}
            accessibilityState={{ checked: active }}
          >
            <Text style={[chip.text, { color: active ? accentColor : colors.textSecondary }]} accessibilityElementsHidden={true}>
              {item.label ?? item.value}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const chip = StyleSheet.create({
  row:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { height: 32, paddingHorizontal: 14, borderRadius: 100, borderWidth: 1, justifyContent: 'center' },
  text: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
});

// ─── Section overline ─────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ label: string }> = ({ label }) => {
  const { colors } = useTheme();
  return <Text style={[sec.heading, { color: colors.text }]}>{label}</Text>;
};

const sec = StyleSheet.create({
  heading: {
    ...TYPOGRAPHY.presets.heading3,
    marginBottom: 8,
  },
});

// ─── Row genérico label + right ───────────────────────────────────────────────
const Row: React.FC<{
  label: string;
  sublabel?: string;
  right: React.ReactNode;
  last?: boolean;
}> = ({ label, sublabel, right, last }) => {
  const { colors } = useTheme();
  return (
    <View style={[rw.container, { borderBottomColor: colors.border }, last && { borderBottomWidth: 0 }]}>
      <View style={rw.left}>
        <Text style={[rw.label, { color: colors.text }]}>{label}</Text>
        {sublabel ? <Text style={[rw.sublabel, { color: colors.textMuted }]}>{sublabel}</Text> : null}
      </View>
      {right}
    </View>
  );
};

const rw = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  left:      { flex: 1, gap: 2 },
  label:     { ...TYPOGRAPHY.presets.body },
  sublabel:  { ...TYPOGRAPHY.presets.caption },
});

// ─── Separador de sección ─────────────────────────────────────────────────────
const Divider: React.FC = () => {
  const { colors } = useTheme();
  return <View style={[div.line, { backgroundColor: colors.border }]} />;
};

const div = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, marginVertical: 32 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { firstName, birthData, natalChart, enneagramType, numerologyProfile, tonePreferences, setTonePreference } = useOnboardingStore();
  const { isDark: isDarkSetting, setIsDark } = useSettingsStore();

  const palette = natalChart?.dominantPlanet ? PLANET_PALETTES[natalChart.dominantPlanet] : DEFAULT_PALETTE;
  const accentColor = palette.primary;

  const { dailyQuote, permissionGranted, toggle: toggleNotification, updateTime } = useNotifications();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour,       setTempHour]       = useState(dailyQuote.hour);
  const [tempMinute,     setTempMinute]     = useState(dailyQuote.minute);

  // ── Dirty state — solo true si el usuario cambia algo en esta sesión ─────
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => setIsDirty(true);

  const handleDone = () => {
    setIsDirty(false);
    navigation.navigate('Today');
  };

  const formattedTime = `${String(dailyQuote.hour).padStart(2, '0')}:${String(dailyQuote.minute).padStart(2, '0')}`;
  const timePickerDate = (() => { const d = new Date(); d.setHours(tempHour, tempMinute, 0, 0); return d; })();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // ── Datos astrológicos ────────────────────────────────────────────────────
  const sunSign        = getSunSign(birthData?.date ?? '');
  const sunSignEs      = sunSign ? ZODIAC_SIGNS.find(z => z.name === sunSign.name)?.nameEs : null;
  const moonSignEs     = natalChart?.moonSign ?? null;
  const risingSignEs   = natalChart?.risingSign ?? null;
  const dominantPlanet = natalChart?.dominantPlanet ?? null;

  // ── Eneagrama ─────────────────────────────────────────────────────────────
  const ennInfo = enneagramType ? ENNEAGRAM_TYPES[enneagramType] : null;

  // ── Numerología ───────────────────────────────────────────────────────────
  const lifePathMeaning     = numerologyProfile ? NUMEROLOGY_MEANINGS[numerologyProfile.lifePath] : null;
  const personalYear        = birthData?.date ? calculatePersonalYear(birthData.date) : null;
  const personalYearMeaning = personalYear ? NUMEROLOGY_MEANINGS[personalYear] : null;

  // ── Fecha de nacimiento formateada ────────────────────────────────────────
  const birthSummary = [birthData?.date, birthData?.time, birthData?.locationName].filter(Boolean).join('  ·  ');

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 20, paddingBottom: Math.max(insets.bottom, 24) + (isDirty ? 80 : 16) }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ══ HERO: nombre ════════════════════════════════════════════════ */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[s.heroName, { color: colors.text }]}>
            {firstName || 'Tú'}
          </Text>
          {birthSummary ? (
            <Text style={[s.heroBirth, { color: colors.textMuted }]}>{birthSummary}</Text>
          ) : null}
        </Animated.View>

        <Divider />

        {/* ══ SECCIÓN: TU MAPA ════════════════════════════════════════════ */}
        <SectionHeader label="Tu mapa" />

        {/* Rueda natal centrada */}
        {birthData?.date && (
          <View style={s.wheelWrap}>
            <NatalChartWheel birthData={birthData} natalChart={natalChart} size={148} />
          </View>
        )}

        {/* Big Three horizontal */}
        <View style={[s.bigThree, { borderColor: colors.border }]}>
          <BigThreeCell
            glyph="☉" label="Sol"
            value={sunSignEs ?? '—'}
            color={PLANET_PALETTES.Sun.primary}
          />
          <View style={[s.bigThreeDivider, { backgroundColor: colors.border }]} />
          <BigThreeCell
            glyph="☽" label="Luna"
            value={moonSignEs ?? '—'}
            color={PLANET_PALETTES.Moon.primary}
          />
          <View style={[s.bigThreeDivider, { backgroundColor: colors.border }]} />
          <BigThreeCell
            glyph="↑" label="Asc"
            value={risingSignEs ?? '—'}
            color={colors.textSecondary}
          />
        </View>

        {/* Eneagrama */}
        {ennInfo && enneagramType && (
          <View style={[s.dataRow, { borderBottomColor: colors.border }]}>
            <Text style={[s.dataGlyph, { color: ACCENT }]}>{enneagramType}</Text>
            <View style={[s.dataVline, { backgroundColor: colors.border }]} />
            <View style={s.dataText}>
              <Text style={[s.dataTitle, { color: colors.text }]}>{ennInfo.name}</Text>
              <Text style={[s.dataDesc, { color: colors.textMuted }]}>{ennInfo.tagline}</Text>
            </View>
          </View>
        )}

        {/* Planeta dominante */}
        {dominantPlanet && (
          <View style={[s.dataRow, { borderBottomColor: colors.border }]}>
            <Text style={[s.dataGlyph, { color: accentColor }]}>
              {PLANET_SYMBOLS[dominantPlanet] ?? '◉'}
            </Text>
            <View style={[s.dataVline, { backgroundColor: colors.border }]} />
            <View style={s.dataText}>
              <Text style={[s.dataTitle, { color: colors.text }]}>Planeta dominante</Text>
              <Text style={[s.dataDesc, { color: colors.textMuted }]}>{dominantPlanet}</Text>
            </View>
          </View>
        )}

        {/* Camino de vida */}
        {numerologyProfile && lifePathMeaning && (
          <View style={[s.dataRow, { borderBottomColor: colors.border }]}>
            <Text style={[s.dataGlyph, { color: ACCENT }]}>{numerologyProfile.lifePath}</Text>
            <View style={[s.dataVline, { backgroundColor: colors.border }]} />
            <View style={s.dataText}>
              <Text style={[s.dataTitle, { color: colors.text }]}>Camino de vida  ·  {lifePathMeaning.titleShort}</Text>
              <Text style={[s.dataDesc, { color: colors.textMuted }]} numberOfLines={2}>{lifePathMeaning.description}</Text>
            </View>
          </View>
        )}

        {/* Año Personal */}
        {personalYear && personalYearMeaning && (
          <View style={[s.dataRow, { borderBottomColor: colors.border }, s.dataRowLast]}>
            <Text style={[s.dataGlyph, { color: ACCENT }]}>{personalYear}</Text>
            <View style={[s.dataVline, { backgroundColor: colors.border }]} />
            <View style={s.dataText}>
              <Text style={[s.dataTitle, { color: colors.text }]}>Año Personal  ·  {personalYearMeaning.titleShort}</Text>
              <Text style={[s.dataDesc, { color: colors.textMuted }]} numberOfLines={2}>{personalYearMeaning.description}</Text>
            </View>
          </View>
        )}

        <Divider />

        {/* ══ SECCIÓN: VOZ DE ENEA ════════════════════════════════════════ */}
        <SectionHeader label="Voz de Enea" />
        <Text style={[s.sectionIntro, { color: colors.text }]}>
          Así habla Enea contigo. Cámbialo cuando quieras.
        </Text>

        <View style={s.toneBlock}>
          <ToneGroup label="Tradición espiritual">
            <ChipRow<SpiritualTradition>
              items={SPIRITUAL_TRADITIONS.map(v => ({ value: v }))}
              selected={tonePreferences.spiritualTradition}
              onSelect={v => { setTonePreference('spiritualTradition', v); markDirty(); }}
              accentColor={ACCENT}
            />
          </ToneGroup>
          <ToneGroup label="Lenguaje">
            <ChipRow<LanguageStyle>
              items={LANGUAGE_STYLES.map(s => ({ value: s.value, label: `${s.value} · ${s.desc}` }))}
              selected={tonePreferences.languageStyle}
              onSelect={v => { setTonePreference('languageStyle', v); markDirty(); }}
              accentColor={ACCENT}
            />
          </ToneGroup>
          <ToneGroup label="Energía">
            <ChipRow<EnergyType>
              items={ENERGY_TYPES.map(v => ({ value: v }))}
              selected={tonePreferences.energy}
              onSelect={v => { setTonePreference('energy', v); markDirty(); }}
              accentColor={ACCENT}
            />
          </ToneGroup>
          <ToneGroup label="Enfoque vital">
            <ChipRow<LifeFocus>
              items={LIFE_FOCUSES.map(v => ({ value: v }))}
              selected={tonePreferences.lifeFocus}
              onSelect={v => { setTonePreference('lifeFocus', v); markDirty(); }}
              accentColor={ACCENT}
            />
          </ToneGroup>
        </View>

        <Divider />

        {/* ══ SECCIÓN: AVISOS ═════════════════════════════════════════════ */}
        <SectionHeader label="Avisos" />

        {permissionGranted === false && (
          <View style={[s.permBanner, { backgroundColor: ACCENT + '12', borderColor: ACCENT + '35' }]}>
            <Text style={[s.permBannerText, { color: colors.text }]}>
              Activa los permisos para recibir tu mensaje diario
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openSettings()}
              style={[s.permBannerBtn, { borderColor: ACCENT }]}
              activeOpacity={0.7}
            >
              <Text style={[s.permBannerBtnText, { color: ACCENT }]}>Abrir ajustes del sistema</Text>
            </TouchableOpacity>
          </View>
        )}

        <Row
          label="Cita diaria"
          sublabel={dailyQuote.enabled ? `${formattedTime} · Cada día` : 'Pausada'}
          last
          right={
            <View style={s.notifRight}>
              <TouchableOpacity
                style={[s.timeBtn, { borderColor: dailyQuote.enabled ? ACCENT + '55' : colors.border }]}
                onPress={() => { setTempHour(dailyQuote.hour); setTempMinute(dailyQuote.minute); setShowTimePicker(true); }}
                disabled={!dailyQuote.enabled}
                activeOpacity={0.7}
                accessibilityLabel={`Hora de notificación: ${formattedTime}`}
                accessibilityRole="button"
              >
                <Text style={[s.timeBtnText, { color: dailyQuote.enabled ? ACCENT : colors.textMuted }]}>
                  {formattedTime}
                </Text>
              </TouchableOpacity>
              <ENEAToggle
                value={dailyQuote.enabled}
                onToggle={() => { toggleNotification(!dailyQuote.enabled); markDirty(); }}
                accentColor={ACCENT}
                accessibilityLabel="Activar cita diaria"
              />
            </View>
          }
        />

        <Divider />

        {/* ══ SECCIÓN: APARIENCIA ═════════════════════════════════════════ */}
        <SectionHeader label="Apariencia" />

        <Row
          label="Modo oscuro"
          sublabel={isDarkSetting ? 'Activado' : 'Modo claro activo'}
          last
          right={
            <ENEAToggle
              value={isDarkSetting}
              onToggle={() => { setIsDark(!isDarkSetting); markDirty(); }}
              accentColor={ACCENT}
            />
          }
        />

        <Divider />

        {/* ══ SECCIÓN: INFO ═══════════════════════════════════════════════ */}
        <SectionHeader label="Info" />

        <Row
          label="Versión"
          right={<Text style={[s.metaText, { color: colors.textMuted }]}>1.0.0</Text>}
        />
        <Row
          label="Política de privacidad"
          right={
            <TouchableOpacity
              onPress={() => Linking.openURL('https://hianadee.github.io/enea/privacy-policy.html')}
              activeOpacity={0.7}
              accessibilityLabel="Abrir política de privacidad"
              accessibilityRole="link"
            >
              <Text style={[s.linkText, { color: ACCENT }]}>Ver →</Text>
            </TouchableOpacity>
          }
        />
        <Row
          label="Soporte"
          last
          right={
            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:hi@astroenea.com')}
              activeOpacity={0.7}
              accessibilityLabel="Enviar email de soporte"
              accessibilityRole="link"
            >
              <Text style={[s.linkText, { color: ACCENT }]}>hi@astroenea.com →</Text>
            </TouchableOpacity>
          }
        />

        {/* Footer */}
        <View style={s.footer}>
          <View style={[s.footerDot, { backgroundColor: ACCENT + '40' }]} />
          <View style={[s.footerLine, { backgroundColor: ACCENT + '18' }]} />
          <Text style={[s.footerEnea, { color: ACCENT }]}>ASTRO ENEA</Text>
          <View style={[s.footerLine, { backgroundColor: ACCENT + '18' }]} />
          <View style={[s.footerDot, { backgroundColor: ACCENT + '40' }]} />
        </View>

      </ScrollView>

      {/* ── Time picker modal ──────────────────────────────────────────────── */}
      <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
        <TouchableOpacity style={s.modalOverlay} onPress={() => setShowTimePicker(false)} activeOpacity={1}>
          <View style={[s.modalCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onStartShouldSetResponder={() => true}>
            <View style={s.modalHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityRole="button" accessibilityLabel="Cancelar">
                <Text style={[s.modalAction, { color: colors.textMuted }]} accessibilityElementsHidden={true}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={[s.modalTitle, { color: colors.text }]}>Hora del aviso</Text>
              <TouchableOpacity
                onPress={() => { updateTime(tempHour, tempMinute); setShowTimePicker(false); markDirty(); }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Listo"
              >
                <Text style={[s.modalAction, { color: ACCENT, fontWeight: '600' }]} accessibilityElementsHidden={true}>Listo</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={timePickerDate}
              mode="time"
              is24Hour
              display="spinner"
              onChange={(_event, selectedDate) => {
                if (!selectedDate) return;
                setTempHour(selectedDate.getHours());
                setTempMinute(selectedDate.getMinutes());
                if (Platform.OS === 'android') {
                  updateTime(selectedDate.getHours(), selectedDate.getMinutes());
                  setShowTimePicker(false);
                  markDirty();
                }
              }}
              style={{ width: '100%' }}
              {...(Platform.OS === 'ios' && { textColor: colors.text })}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Tira "Hecho" flotante ─────────────────────────────────────────── */}
      {isDirty && (
        <Animated.View
          style={[
            s.doneStrip,
            { bottom: 0, backgroundColor: colors.surfaceElevated, borderTopColor: ACCENT + '28' },
            { opacity: fadeAnim },
          ]}
        >
          <Text style={[s.doneLabel, { color: colors.text }]}>Cambios sin guardar</Text>
          <TouchableOpacity
            onPress={handleDone}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 16, right: 4 }}
            accessibilityLabel="Guardar cambios y volver a Hoy"
            accessibilityRole="button"
          >
            <Text style={[s.doneBtnText, { color: ACCENT }]}>Hecho</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

// ─── BigThreeCell ─────────────────────────────────────────────────────────────
const BigThreeCell: React.FC<{ glyph: string; label: string; value: string; color: string }> = ({ glyph, label, value, color }) => {
  const { colors } = useTheme();
  return (
    <View style={bt.cell}>
      <Text style={[bt.glyph, { color }]}>{glyph}</Text>
      <Text style={[bt.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[bt.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

const bt = StyleSheet.create({
  cell:  { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 14 },
  glyph: { fontSize: 18 },
  label: { ...TYPOGRAPHY.presets.micro },
  value: { ...TYPOGRAPHY.presets.bodySmMedium, textAlign: 'center' },
});

// ─── ToneGroup ────────────────────────────────────────────────────────────────
const ToneGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  const { colors } = useTheme();
  return (
    <View style={[tg.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[tg.label, { color: colors.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
};

const tg = StyleSheet.create({
  group: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  label: { ...TYPOGRAPHY.presets.label },
});

// ─── Estilos principales ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1 },

  scroll: {
    paddingHorizontal: 24,
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  heroName: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: -0.5,
    fontStyle: 'italic',
    lineHeight: 52,
  },
  heroBirth: {
    ...TYPOGRAPHY.presets.caption,
    marginTop: 6,
    letterSpacing: 0.2,
  },

  // ── Tu mapa ─────────────────────────────────────────────────────────────────
  wheelWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bigThree: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    marginBottom: 4,
    overflow: 'hidden',
  },
  bigThreeDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dataRowLast: {
    borderBottomWidth: 0,
  },
  dataGlyph: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 32,
    fontWeight: '300',
    width: 38,
    textAlign: 'center',
    lineHeight: 36,
  },
  dataVline: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  dataText: { flex: 1, gap: 2 },
  dataTitle: { ...TYPOGRAPHY.presets.body },
  dataDesc:  { ...TYPOGRAPHY.presets.caption },

  // ── Voz de Enea ─────────────────────────────────────────────────────────────
  sectionIntro: {
    ...TYPOGRAPHY.presets.bodyLg,
    marginBottom: 16,
    marginTop: 4,
  },
  toneBlock: { gap: 12 },

  // ── Avisos ───────────────────────────────────────────────────────────────────
  permBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginBottom: 12,
  },
  permBannerText: { ...TYPOGRAPHY.presets.bodySm, lineHeight: 20 },
  permBannerBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  permBannerBtnText: { ...TYPOGRAPHY.presets.bodySm, fontWeight: '600' },

  notifRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    minWidth: 52,
    alignItems: 'center',
  },
  timeBtnText: { ...TYPOGRAPHY.presets.bodySmMedium, letterSpacing: 0.5 },

  // ── Genéricos ────────────────────────────────────────────────────────────────
  metaText: { ...TYPOGRAPHY.presets.bodySm },
  linkText:  { ...TYPOGRAPHY.presets.bodySm, fontWeight: '500' },

  // ── Done strip ───────────────────────────────────────────────────────────────
  doneStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  doneLabel:   { fontSize: 15, fontWeight: '500', letterSpacing: 0.1 },
  doneBtnText: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },

  // ── Modal ─────────────────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
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
  modalTitle:  { ...TYPOGRAPHY.presets.body, fontWeight: '500' },
  modalAction: { ...TYPOGRAPHY.presets.body },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 10,
  },
  footerDot:  { width: 3, height: 3, borderRadius: 2 },
  footerLine: { width: 28, height: 1 },
  footerEnea: { fontSize: 10, fontWeight: '600', letterSpacing: 2 },
});
