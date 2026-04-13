import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '@/design-system/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStackParamList } from '@/navigation/types';

// Native time picker — iOS & Android (M3 clock dial on Android)
let DateTimePicker: React.ComponentType<any> | null = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'BirthTime'>;
};

const TOTAL = 10;

// iOS native spinner constants — 7 rows × 44pt = 308pt
const IOS_PICKER_HEIGHT = 308;
const IOS_ROW_HEIGHT    = 44;
const IOS_LINE_TOP      = (IOS_PICKER_HEIGHT - IOS_ROW_HEIGHT) / 2;
const IOS_LINE_BOTTOM   = IOS_LINE_TOP + IOS_ROW_HEIGHT;

const DEFAULT_TIME = (() => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
})();

function toTimeStr(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const BirthTimeScreen: React.FC<Props> = ({ navigation }) => {
  const { setBirthData, setStep } = useOnboardingStore();

  const [time,       setTime]       = useState<Date>(DEFAULT_TIME);
  const [showPicker, setShowPicker] = useState(false);

  // Web state
  const [webText, setWebText] = useState('12:00');

  const handleChange = (_event: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
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
    if (Platform.OS === 'web') {
      const [hStr, mStr] = webText.split(':');
      const h = parseInt(hStr ?? '12', 10);
      const m = parseInt(mStr ?? '0', 10);
      if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      return '12:00';
    }
    return toTimeStr(time);
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
        <View style={styles.headingGroup}>
          <Text style={styles.heading}>¿Sabes tu hora{'\n'}de nacimiento?</Text>
          <Text style={styles.helper}>
            Con ella puedo calcular tu Ascendente. Si no la sabes exacta, una aproximación funciona.
          </Text>
        </View>

        <View style={styles.pickerWrapper}>

          {Platform.OS === 'web' ? (
            /* ── Web: native HTML time input ── */
            <View style={styles.webInputContainer}>
              {/* @ts-ignore */}
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
            /* ── Android: M3 clock dial (tap to open) ── */
            <>
              <TouchableOpacity
                style={styles.timeDisplay}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.75}
                accessibilityLabel={`Hora seleccionada: ${toTimeStr(time)}. Toca para cambiar`}
                accessibilityRole="button"
              >
                <Text style={styles.timeText}>{toTimeStr(time)}</Text>
                <Text style={styles.timeTapHint}>Toca para cambiar</Text>
              </TouchableOpacity>

              {showPicker && DateTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="default"
                  is24Hour={true}
                  onChange={handleChange}
                />
              )}
            </>

          ) : DateTimePicker ? (
            /* ── iOS: native 24h spinner (inline) ── */
            <View style={styles.iosPicker}>
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                is24Hour={true}
                onChange={handleChange}
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
          <Text style={styles.skipBtnNote}>
            Usaré el mediodía como referencia. Puedes actualizarlo después.
          </Text>
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
  },
  headingGroup: {
    paddingTop: 32,
    paddingHorizontal: 28,
    zIndex: 1,
  },
  heading: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 32,
    color: colors.fg.primary,
    lineHeight: 42,
    marginBottom: 8,
  },
  helper: {
    fontSize: 14,
    color: '#A8A8B8',
    fontWeight: '500',
    lineHeight: 21,
  },
  pickerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── Android: hora como texto + tap ──
  timeDisplay: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  timeText: {
    fontFamily: 'serif',
    fontSize: 56,
    color: colors.fg.primary,
    letterSpacing: 4,
    lineHeight: 68,
  },
  timeTapHint: {
    fontSize: 13,
    color: '#555565',
    letterSpacing: 0.5,
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
