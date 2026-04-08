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
import { WheelPicker } from '@/design-system/components/WheelPicker';

// Native time picker — iOS only
let DateTimePicker: React.ComponentType<any> | null = null;
if (Platform.OS === 'ios') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'BirthTime'>;
};

const TOTAL = 10;

// iOS native spinner constants
const IOS_PICKER_HEIGHT = 216;
const IOS_ROW_HEIGHT    = 44;
const IOS_LINE_TOP      = (IOS_PICKER_HEIGHT - IOS_ROW_HEIGHT) / 2;  // 86
const IOS_LINE_BOTTOM   = IOS_LINE_TOP + IOS_ROW_HEIGHT;              // 130

// Default: noon (12:00)
const DEFAULT_HOUR   = 12;
const DEFAULT_MINUTE = 0;
const DEFAULT_TIME   = (() => {
  const d = new Date();
  d.setHours(DEFAULT_HOUR, DEFAULT_MINUTE, 0, 0);
  return d;
})();

// Android scroll picker data
const HOURS   = Array.from({ length: 24 }, (_, i) => String(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function toTimeStr(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const BirthTimeScreen: React.FC<Props> = ({ navigation }) => {
  const { setBirthData, setStep } = useOnboardingStore();

  // iOS state
  const [time, setTime] = useState<Date>(DEFAULT_TIME);

  // Android state (0-based indices into HOURS / MINUTES)
  const [hourIdx, setHourIdx] = useState(DEFAULT_HOUR);
  const [minIdx,  setMinIdx]  = useState(DEFAULT_MINUTE);

  // Web state
  const [webText, setWebText] = useState('12:00');

  const handleIosChange = (_event: unknown, selected?: Date) => {
    if (selected) setTime(selected);
  };

  const handleWebChange = (value: string) => {
    setWebText(value);
    const [hStr, mStr] = value.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr ?? '0', 10);
    if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      const d = new Date(time);
      d.setHours(h, m, 0, 0);
      setTime(d);
    }
  };

  const buildTimeString = (): string => {
    if (Platform.OS === 'android') {
      return `${String(hourIdx).padStart(2, '0')}:${String(minIdx).padStart(2, '0')}`;
    }
    if (Platform.OS === 'web') {
      const [hStr, mStr] = webText.split(':');
      const h = parseInt(hStr ?? '12', 10);
      const m = parseInt(mStr ?? '0', 10);
      if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      return '12:00';
    }
    return toTimeStr(time); // iOS
  };

  const navigate = (timeStr: string) => {
    setBirthData({ time: timeStr });
    setStep('natal_chart');
    navigation.navigate('NatalChartPreview');
  };

  const handleContinue = () => navigate(buildTimeString());
  const handleSkip     = () => navigate('12:00');

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
        <Text style={styles.stepCounter}>4 de {TOTAL}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.heading}>¿Sabes tu hora{'\n'}de nacimiento?</Text>
        <Text style={styles.helper}>
          Con ella puedo calcular tu Ascendente. Si no la sabes exacta, una aproximación funciona.
        </Text>

        {/* Picker — vertically centered between heading and footer */}
        <View style={styles.pickerWrapper}>

          {Platform.OS === 'web' ? (
            /* ── Web: native HTML time input ── */
            <View style={styles.webInputContainer}>
              {/* @ts-ignore — HTML <input> used only in web context */}
              <input
                type="time"
                value={webText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleWebChange(e.target.value)
                }
                style={{
                  backgroundColor: 'transparent',
                  color: colors.fg.primary,
                  border: 'none',
                  outline: 'none',
                  fontSize: 48,
                  fontFamily: 'Georgia, serif',
                  textAlign: 'center',
                  width: '100%',
                  padding: 0,
                  letterSpacing: 4,
                  colorScheme: 'dark',
                } as React.CSSProperties}
                aria-label="Hora de nacimiento"
              />
            </View>

          ) : Platform.OS === 'android' ? (
            /* ── Android: hour + minute WheelPicker columns ── */
            <View
              style={styles.androidRow}
              accessibilityLabel="Selector de hora de nacimiento"
            >
              <View style={styles.timeCol}>
                <WheelPicker
                  items={HOURS}
                  defaultIndex={hourIdx}
                  onChange={setHourIdx}
                  isPrimary
                />
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeCol}>
                <WheelPicker
                  items={MINUTES}
                  defaultIndex={minIdx}
                  onChange={setMinIdx}
                  isPrimary
                />
              </View>
            </View>

          ) : DateTimePicker ? (
            /* ── iOS: native 24h spinner ── */
            <View style={styles.iosPicker}>
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                is24Hour={true}
                onChange={handleIosChange}
                themeVariant="dark"
                textColor="#FFFFFF"
                style={styles.iosPickerInner}
                locale="es"
                accessibilityLabel="Selector de hora de nacimiento"
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
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={handleSkip}
          activeOpacity={0.7}
          accessibilityLabel="No sé la hora, usaré el mediodía como referencia"
          accessibilityRole="button"
        >
          <Text style={styles.skipBtnText}>No lo sé</Text>
          <Text style={styles.skipBtnNote}>Usaré el mediodía como referencia. Puedes actualizarlo después.</Text>
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
    lineHeight: 21,
  },
  // Centres the picker vertically in the space between heading and footer
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── Android layout ──
  androidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  timeCol: {
    width: 100,
  },
  timeSeparator: {
    color: colors.fg.primary,
    fontSize: 40,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 48,
    marginBottom: 4,
    opacity: 0.6,
  },
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
    gap: 8,
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
  skipBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  skipBtnText: {
    color: colors.fg.secondary,
    fontSize: 14,
  },
  skipBtnNote: {
    color: '#8A8A9A',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
});
