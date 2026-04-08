import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, typography, spacing } from '@/design-system/tokens';
import { Button, Card, Input } from '@/design-system/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStackParamList } from '@/navigation/types';
import { WheelPicker, PICKER_HEIGHT as WHEEL_HEIGHT } from '@/design-system/components/WheelPicker';

// Native date picker — iOS only
let DateTimePicker: React.ComponentType<any> | null = null;
if (Platform.OS === 'ios') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'BirthDate'>;
};

const TOTAL = 10;
const MIN_YEAR = 1920;
const MAX_YEAR = 2010;
const DEFAULT_DATE = new Date('1985-06-15');

// iOS native spinner constants
const IOS_PICKER_HEIGHT = 216;
const IOS_ROW_HEIGHT    = 44;
const IOS_LINE_TOP      = (IOS_PICKER_HEIGHT - IOS_ROW_HEIGHT) / 2;  // 86
const IOS_LINE_BOTTOM   = IOS_LINE_TOP + IOS_ROW_HEIGHT;              // 130

// Android scroll picker data
const DAYS   = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const YEARS  = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => String(MIN_YEAR + i));

function toISODate(d: Date): string {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const BirthDateScreen: React.FC<Props> = ({ navigation }) => {
  const { setBirthData, setStep } = useOnboardingStore();

  // iOS state
  const [date, setDate] = useState<Date>(DEFAULT_DATE);

  // Android state (0-based indices into DAYS / MONTHS / YEARS)
  const [dayIdx,   setDayIdx]   = useState(DEFAULT_DATE.getDate() - 1);
  const [monthIdx, setMonthIdx] = useState(DEFAULT_DATE.getMonth());
  const [yearIdx,  setYearIdx]  = useState(DEFAULT_DATE.getFullYear() - MIN_YEAR);

  // Web state
  const [webText, setWebText] = useState(toISODate(DEFAULT_DATE));

  const handleIosChange = (_event: unknown, selected?: Date) => {
    if (selected) setDate(selected);
  };

  const handleWebChange = (value: string) => {
    setWebText(value);
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) setDate(parsed);
  };

  const buildDateString = (): string => {
    if (Platform.OS === 'android') {
      const d = String(dayIdx + 1).padStart(2, '0');
      const m = String(monthIdx + 1).padStart(2, '0');
      const y = String(MIN_YEAR + yearIdx);
      return `${y}-${m}-${d}`;
    }
    if (Platform.OS === 'web') {
      const parsed = new Date(webText);
      return isNaN(parsed.getTime()) ? toISODate(DEFAULT_DATE) : webText;
    }
    return toISODate(date); // iOS
  };

  const handleContinue = () => {
    setBirthData({ date: buildDateString() });
    setStep('birth_place');
    navigation.navigate('BirthPlace');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Volver a la pantalla anterior"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepCounter}>2 de {TOTAL}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.heading}>¿Cuándo naciste?</Text>
        <Text style={styles.helper}>Tu fecha de nacimiento es el primer dato de tu mapa personal.</Text>

        {/* Picker — vertically centered between heading and footer */}
        <View style={styles.pickerWrapper}>

          {Platform.OS === 'web' ? (
            /* ── Web: native HTML date input ── */
            <View style={styles.webInputContainer}>
              {/* @ts-ignore — HTML <input> used only in web context */}
              <input
                type="date"
                value={webText}
                min={`${MIN_YEAR}-01-01`}
                max={`${MAX_YEAR}-12-31`}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleWebChange(e.target.value)
                }
                style={{
                  backgroundColor: 'transparent',
                  color: colors.fg.primary,
                  border: 'none',
                  outline: 'none',
                  fontSize: 32,
                  fontFamily: 'Georgia, serif',
                  textAlign: 'center',
                  width: '100%',
                  padding: 0,
                  colorScheme: 'dark',
                } as React.CSSProperties}
                aria-label="Fecha de nacimiento"
              />
            </View>

          ) : Platform.OS === 'android' ? (
            /* ── Android: three WheelPicker columns ── */
            <View
              style={styles.androidRow}
              accessibilityLabel="Selector de fecha de nacimiento"
            >
              <View style={styles.colNarrow}>
                <WheelPicker
                  items={DAYS}
                  defaultIndex={dayIdx}
                  onChange={setDayIdx}
                />
              </View>
              <View style={styles.colWide}>
                <WheelPicker
                  items={MONTHS}
                  defaultIndex={monthIdx}
                  onChange={setMonthIdx}
                  isPrimary
                />
              </View>
              <View style={styles.colMid}>
                <WheelPicker
                  items={YEARS}
                  defaultIndex={yearIdx}
                  onChange={setYearIdx}
                />
              </View>
            </View>

          ) : DateTimePicker ? (
            /* ── iOS: native spinner ── */
            <View style={styles.iosPicker}>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                minimumDate={new Date(`${MIN_YEAR}-01-01`)}
                maximumDate={new Date(`${MAX_YEAR}-12-31`)}
                onChange={handleIosChange}
                themeVariant="dark"
                textColor="#FFFFFF"
                style={styles.iosPickerInner}
                locale="es"
                accessibilityLabel="Selector de fecha de nacimiento"
              />
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <View style={[styles.selectionLine, { top: IOS_LINE_TOP }]} />
                <View style={[styles.selectionLine, { top: IOS_LINE_BOTTOM }]} />
              </View>
            </View>

          ) : null}

        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
          accessibilityLabel="Continuar al siguiente paso"
          accessibilityRole="button"
        >
          <Text style={styles.ctaBtnText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backBtn:      { width: 40, height: 44, justifyContent: 'center' },
  backArrow:    { color: colors.fg.primary, fontSize: 22 },
  headerSpacer: { width: 40 },
  stepCounter: {
    flex: 1,
    textAlign: 'center',
    color: colors.fg.secondary,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingTop: 32,
  },
  heading: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 32,
    color: colors.fg.primary,
    lineHeight: 42,
    paddingHorizontal: 28,
    marginBottom: 8,
  },
  helper: {
    fontSize: 14,
    color: '#A8A8B8',
    paddingHorizontal: 28,
    fontWeight: '500',
  },
  // Centres the picker vertically in the space between heading and footer
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── Android columns ──
  androidRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 8,
  },
  colNarrow: { flex: 1 },   // day  (1–31)
  colWide:   { flex: 2 },   // month (Septiembre is the longest)
  colMid:    { flex: 1.4 }, // year  (4-digit)
  // ── iOS native spinner ──
  iosPicker: {
    position: 'relative',
    width: '100%',
    height: IOS_PICKER_HEIGHT,
  },
  iosPickerInner: {
    width: '100%',
    height: IOS_PICKER_HEIGHT,
    backgroundColor: 'transparent',
  },
  selectionLine: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // ── Web ──
  webInputContainer: {
    width: '80%',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  ctaBtn: {
    backgroundColor: colors.fg.primary,
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    color: colors.bg.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
