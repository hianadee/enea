import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePostHog } from 'posthog-react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { TYPOGRAPHY, FONT_FAMILY } from '@/constants/theme';
import { GenderPreference } from '@/types';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'FirstName'>;
};

const TOTAL = 10;
const ACCENT = '#FC8181';

const GENDER_OPTIONS: { value: GenderPreference; label: string }[] = [
  { value: 'femenino',  label: 'En femenino' },
  { value: 'masculino', label: 'En masculino' },
  { value: 'neutro',    label: 'Sin género' },
];

export const FirstNameScreen: React.FC<Props> = ({ navigation }) => {
  const { setFirstName, setGenderPreference, setStep } = useOnboardingStore();
  const posthog = usePostHog();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<GenderPreference | null>(null);

  const isNameValid  = name.trim().length > 0;
  const isValid      = isNameValid; // género es opcional, default 'neutro'

  const handleContinue = () => {
    if (!isValid) return;
    setFirstName(name.trim());
    setGenderPreference(gender ?? 'neutro');
    posthog?.capture('onboarding_name_entered', { gender: gender ?? 'neutro' });
    setStep('birth_date');
    navigation.navigate('BirthDate');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.stepCounter}>1 de {TOTAL}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.heading}>¿Cómo te llamas?</Text>
          <Text style={styles.subheading}>Así sabré cómo dirigirme a ti.</Text>

          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor="#444444"
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
            keyboardType="default"
            textContentType="name"
            returnKeyType="done"
            maxLength={50}
            onSubmitEditing={handleContinue}
            accessibilityLabel="Tu nombre"
          />

          {/* Gender chips — aparecen cuando el nombre tiene al menos 1 carácter */}
          {isNameValid && (
            <View style={styles.genderBlock}>
              <Text style={styles.genderLabel}>¿Cómo prefieres que te hable?</Text>
              <View style={styles.genderChips}>
                {GENDER_OPTIONS.map(opt => {
                  const active = gender === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.chip,
                        {
                          borderColor: active ? ACCENT : '#2A2A3A',
                          backgroundColor: active ? ACCENT + '14' : 'transparent',
                        },
                      ]}
                      onPress={() => setGender(active ? null : opt.value)}
                      activeOpacity={0.7}
                      accessibilityRole="radio"
                      accessibilityLabel={opt.label}
                      accessibilityState={{ checked: active }}
                    >
                      <Text style={[styles.chipText, { color: active ? ACCENT : '#8B8A9E' }]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.ctaBtn, !isValid && styles.ctaBtnDisabled]}
            onPress={handleContinue}
            disabled={!isValid}
            activeOpacity={0.85}
            accessibilityLabel="Continuar al siguiente paso"
            accessibilityRole="button"
            accessibilityState={{ disabled: !isValid }}
          >
            <Text style={styles.ctaBtnText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  flex: { flex: 1 },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerSpacer: { width: 40 },
  stepCounter: {
    flex: 1,
    textAlign: 'center',
    color: '#8B8A9E',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  heading: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 34,
    color: '#F0EEF6',
    lineHeight: 44,
    marginBottom: 8,
  },
  subheading: {
    ...TYPOGRAPHY.presets.bodyLg,
    color: '#8B8A9E',
    marginBottom: 44,
  },
  input: {
    fontSize: 28,
    color: '#F0EEF6',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3A',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },

  // ── Bloque de género ──────────────────────────────────────────────────────────
  genderBlock: {
    marginTop: 36,
  },
  genderLabel: {
    ...TYPOGRAPHY.presets.label,
    color: '#8B8A9E',
    marginBottom: 12,
  },
  genderChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  ctaBtn: {
    backgroundColor: '#F0EEF6',
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnDisabled: { opacity: 0.3 },
  ctaBtnText: {
    color: '#1A2332',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
