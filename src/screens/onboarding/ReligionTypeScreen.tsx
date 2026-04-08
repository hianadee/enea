import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ReligionType'>;
};

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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Volver a la pantalla anterior"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepCounter}>9 de 10</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} accessibilityRole="button">
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>¿Cuál?</Text>
        <Text style={styles.subtitle}>
          Enea la usará para encontrar las palabras justas.
        </Text>

        <View style={styles.options}>
          {RELIGIONS.map(religion => (
            <TouchableOpacity
              key={religion}
              style={[styles.optionRow, selected === religion && styles.optionRowActive]}
              onPress={() => handleSelect(religion)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === religion }}
            >
              <View style={[styles.radio, selected === religion && styles.radioActive]}>
                {selected === religion && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.optionText, selected === religion && styles.optionTextActive]}>
                {religion}
              </Text>
            </TouchableOpacity>
          ))}
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
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backBtn: { width: 40, height: 44, justifyContent: 'center' },
  backArrow: { color: colors.fg.primary, fontSize: 22 },
  stepCounter: {
    flex: 1,
    textAlign: 'center',
    color: colors.fg.secondary,
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
    color: '#A8A8B8',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
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
    backgroundColor: '#080808',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },
  optionRowActive: {
    borderColor: colors.fg.primary,
    backgroundColor: '#111111',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.fg.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.fg.primary,
  },
  optionText: {
    fontSize: 16,
    color: '#A8A8B8',
    flex: 1,
  },
  optionTextActive: {
    color: colors.fg.primary,
  },
});
