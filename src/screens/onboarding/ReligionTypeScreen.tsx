import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FONT_FAMILY, TYPOGRAPHY } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ReligionType'>;
};

const TOTAL = 10;

const RELIGIONS = [
  'Cristianismo',
  'Budismo',
  'Judaísmo',
  'Islam',
  'Hinduismo',
  'Otra',
];

export const ReligionTypeScreen: React.FC<Props> = ({ navigation }) => {
  const { setReligion, setStep } = useOnboardingStore();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    setReligion(value);
    setStep('tone');
    navigation.navigate('TonePreferences');
  };

  const handleSkip = () => {
    setStep('tone');
    navigation.navigate('TonePreferences');
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
        <Text style={styles.stepCounter}>9 de {TOTAL}</Text>
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipBtn}
          accessibilityRole="button"
          accessibilityLabel="Saltar este paso"
        >
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>¿Cuál?</Text>
        <Text style={styles.subtitle}>
          Enea la usará para encontrar las palabras justas.
        </Text>

        <View
          style={styles.options}
          accessibilityRole="radiogroup"
          accessibilityLabel="Tradición espiritual"
        >
          {RELIGIONS.map(religion => {
            const isActive = selected === religion;
            return (
              <TouchableOpacity
                key={religion}
                style={[styles.optionRow, isActive && styles.optionRowActive]}
                onPress={() => handleSelect(religion)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityLabel={religion}
                accessibilityState={{ checked: isActive }}
              >
                {/* Radio circle */}
                <View style={[styles.radio, isActive && styles.radioActive]}>
                  {isActive && <View style={styles.radioDot} />}
                </View>

                {/* Label — siempre blanco primario */}
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                  {religion}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
  stepCounter: {
    flex: 1,
    textAlign: 'center',
    color: '#8B8A9E',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  skipBtn: {
    width: 60,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skipText: {
    ...TYPOGRAPHY.presets.bodySm,
    color: '#8B8A9E',
    letterSpacing: 0.2,
  },

  // ── Scroll ──────────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
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

  // ── Option list ─────────────────────────────────────────────────────────────
  options: {
    gap: 16,
  },

  // Row — mismo spec que ReligionScreen: minHeight 64, border neutral
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

  // Radio
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

  // Label — blanco primario en reposo, más brillante al seleccionar
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
