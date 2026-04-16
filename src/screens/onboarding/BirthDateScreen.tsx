import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { colors } from '@/design-system/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePostHog } from 'posthog-react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStackParamList } from '@/navigation/types';

// Native date picker — iOS & Android (M3 calendar dialog on Android)
let DateTimePicker: React.ComponentType<any> | null = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'BirthDate'>;
};

const TOTAL    = 10;
const MIN_YEAR = 1920;
const MAX_YEAR = 2010;
const DEFAULT_DATE = new Date('1985-06-15');

// iOS native spinner constants — 7 rows × 44pt = 308pt
const IOS_PICKER_HEIGHT = 308;
const IOS_ROW_HEIGHT    = 44;
const IOS_LINE_TOP      = (IOS_PICKER_HEIGHT - IOS_ROW_HEIGHT) / 2;
const IOS_LINE_BOTTOM   = IOS_LINE_TOP + IOS_ROW_HEIGHT;

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function toISODate(d: Date): string {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplay(d: Date): string {
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

export const BirthDateScreen: React.FC<Props> = ({ navigation }) => {
  const { setBirthData, setStep } = useOnboardingStore();
  const posthog = usePostHog();

  const [date, setDate] = useState<Date>(DEFAULT_DATE);

  // Android Modal picker state
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(DEFAULT_DATE);

  // Web state
  const [webText, setWebText] = useState(toISODate(DEFAULT_DATE));

  const handleChange = (_event: unknown, selected?: Date) => {
    if (selected) setDate(selected);
  };

  // Android Modal handlers
  const handleAndroidChange = (_event: unknown, selected?: Date) => {
    if (selected) setTempDate(selected);
  };
  const handleAndroidDone = () => {
    setDate(tempDate);
    setShowAndroidPicker(false);
  };
  const openAndroidPicker = () => {
    setTempDate(date);
    setShowAndroidPicker(true);
  };

  const handleWebChange = (value: string) => {
    setWebText(value);
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) setDate(parsed);
  };

  const buildDateString = (): string => {
    if (Platform.OS === 'web') {
      const parsed = new Date(webText);
      return isNaN(parsed.getTime()) ? toISODate(DEFAULT_DATE) : webText;
    }
    return toISODate(date);
  };

  const handleContinue = () => {
    setBirthData({ date: buildDateString() });
    posthog?.capture('onboarding_birth_date_set');
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
        {/* Heading — flujo normal, queda en la parte superior */}
        <View style={styles.headingGroup}>
          <Text style={styles.heading}>¿Cuándo naciste?</Text>
          <Text style={styles.helper}>
            Tu fecha de nacimiento es el primer dato de tu mapa personal.
          </Text>
        </View>

        {/* Picker — absoluto sobre toda el área de contenido para centrar en pantalla */}
        <View style={styles.pickerWrapper}>

          {Platform.OS === 'web' ? (
            /* ── Web: native HTML date input ── */
            <View style={styles.webInputContainer}>
              {/* @ts-ignore */}
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
            /* ── Android: fecha como texto + Modal con spinner ── */
            <>
              <TouchableOpacity
                style={styles.dateDisplay}
                onPress={openAndroidPicker}
                activeOpacity={0.75}
                accessibilityLabel={`Fecha seleccionada: ${formatDisplay(date)}. Toca para cambiar.`}
                accessibilityRole="button"
              >
                <Text style={styles.dateText}>{formatDisplay(date)}</Text>
                <Text style={styles.dateTapHint}>TOCA PARA CAMBIAR</Text>
              </TouchableOpacity>

              <Modal
                visible={showAndroidPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAndroidPicker(false)}
                statusBarTranslucent
              >
                <View style={styles.androidModalOverlay}>
                  <View style={styles.androidModalSheet}>
                    <Text style={styles.androidModalTitle}>Fecha de nacimiento</Text>

                    {DateTimePicker && (
                      <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="spinner"
                        minimumDate={new Date(`${MIN_YEAR}-01-01`)}
                        maximumDate={new Date(`${MAX_YEAR}-12-31`)}
                        onChange={handleAndroidChange}
                        style={{ width: '100%' }}
                      />
                    )}

                    <TouchableOpacity
                      style={styles.androidDoneBtn}
                      onPress={handleAndroidDone}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel="Confirmar fecha"
                    >
                      <Text style={styles.androidDoneBtnText}>Hecho</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          ) : DateTimePicker ? (
            /* ── iOS: native spinner (inline) ── */
            <View style={styles.iosPicker}>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                minimumDate={new Date(`${MIN_YEAR}-01-01`)}
                maximumDate={new Date(`${MAX_YEAR}-12-31`)}
                onChange={handleChange}
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
  backBtn:      { width: 44, height: 44, justifyContent: 'center' },
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
  // ── Android: fecha como texto + tap ──
  dateDisplay: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  dateText: {
    fontFamily: 'serif',
    fontSize: 34,
    color: colors.fg.primary,
    textAlign: 'center',
    lineHeight: 44,
  },
  dateTapHint: {
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
  // ── Android Modal picker ──
  androidModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  androidModalSheet: {
    backgroundColor: '#0F0F16',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  androidModalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  androidDoneBtn: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  androidDoneBtnText: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
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
