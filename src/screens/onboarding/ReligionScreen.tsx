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

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Religion'>;
};

type ReligionResponse = 'si' | 'no' | 'espiritual';

const OPTIONS: { value: ReligionResponse; label: string }[] = [
  { value: 'si',         label: 'Sí' },
  { value: 'espiritual', label: 'Interés espiritual, pero sin religión' },
  { value: 'no',         label: 'Prefiero no responder' },
];

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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Volver a la pantalla anterior"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepCounter}>8 de 10</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>¿Eres religioso/a?</Text>
        <Text style={styles.subtitle}>
          Conocerlo me permitirá hablarte en un lenguaje que conecte contigo.
        </Text>

        <View style={styles.options}>
          {OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionRow, selected === option.value && styles.optionRowActive]}
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === option.value }}
            >
              <View style={[styles.radio, selected === option.value && styles.radioActive]}>
                {selected === option.value && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.optionText, selected === option.value && styles.optionTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
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
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backBtn: { width: 40, height: 44, justifyContent: 'center' },
  backArrow: { color: colors.fg.primary, fontSize: 22 },
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
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  heading: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 34,
    color: colors.fg.primary,
    lineHeight: 44,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    color: '#A8A8B8',
    lineHeight: 22,
    marginBottom: 48,
  },
  options: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(116, 116, 128, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.6)',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
    gap: 19,
    overflow: 'hidden',
  },
  optionRowActive: {
    borderColor: '#FFFFFF',
  },
  radio: {
    width: 19.45,
    height: 19.45,
    borderRadius: 9.72,
    borderWidth: 1,
    borderColor: '#FC8181',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#FC8181',
  },
  radioDot: {
    width: 11.45,
    height: 11.45,
    borderRadius: 5.72,
    backgroundColor: '#FC8181',
    position: 'absolute',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
});
