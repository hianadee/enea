import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FONT_FAMILY, TYPOGRAPHY } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Religion'>;
};

type ReligionResponse = 'si' | 'no' | 'espiritual';

const OPTIONS: { value: ReligionResponse; label: string }[] = [
  { value: 'si',         label: 'Sí' },
  { value: 'no',         label: 'No' },
  { value: 'espiritual', label: 'Interés espiritual, pero sin religión' },
];

const TOTAL = 10;

export const ReligionScreen: React.FC<Props> = ({ navigation }) => {
  const { setReligionResponse, setStep } = useOnboardingStore();
  const [selected, setSelected] = useState<ReligionResponse | null>(null);

  const handleSelect = (value: ReligionResponse) => {
    setSelected(value);
    setReligionResponse(value);
    if (value === 'si') {
      setStep('religion_type');
      navigation.navigate('ReligionType');
    } else {
      setStep('tone');
      navigation.navigate('TonePreferences');
    }
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
        <Text style={styles.stepCounter}>8 de {TOTAL}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Género neutral: sin -o/a */}
        <Text style={styles.heading}>¿Practicas{'\n'}alguna religión?</Text>
        <Text style={styles.subtitle}>
          Conocerlo me permitirá hablarte en un lenguaje que conecte contigo.
        </Text>

        <View
          style={styles.options}
          accessibilityRole="radiogroup"
          accessibilityLabel="¿Practicas alguna religión?"
        >
          {OPTIONS.map(option => {
            const isActive = selected === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionRow, isActive && styles.optionRowActive]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: isActive }}
              >
                <View style={[styles.radio, isActive && styles.radioActive]}>
                  {isActive && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backBtn:      { width: 44, height: 44, justifyContent: 'center' },
  backArrow:    { color: '#F0EEF6', fontSize: 22 },
  headerSpacer: { width: 40 },
  stepCounter: {
    flex: 1,
    textAlign: 'center',
    color: '#8B8A9E',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // ── Content ────────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  heading: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 34,
    color: '#F0EEF6',
    lineHeight: 44,
    marginBottom: 12,
  },
  subtitle: {
    ...TYPOGRAPHY.presets.bodyLg,
    color: '#8B8A9E',
    marginBottom: 48,
  },

  // ── Options — idéntico a ReligionTypeScreen ────────────────────────────────
  options: {
    gap: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111118',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2A2A3A',
    borderRadius: 16,
    minHeight: 64,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
  },
  optionRowActive: {
    borderWidth: 1,
    borderColor: '#F0EEF6',
    backgroundColor: '#16161F',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#3A3A4A',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioActive: {
    borderColor: '#FC8181',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FC8181',
  },
  optionText: {
    flex: 1,
    ...TYPOGRAPHY.presets.body,
    color: '#F0EEF6',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
