import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, FONT_FAMILY } from '@/constants/theme';
import {
  LanguageStyle,
  EnergyType,
  LifeFocus,
} from '@/types';
import { OnboardingStackParamList } from '@/navigation/types';

const ACCENT = '#FC8181';
const TOTAL  = 10;

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'TonePreferences'>;
};

// ─── Datos ────────────────────────────────────────────────────────────────────

const LANGUAGE_STYLES: { value: LanguageStyle; label: string }[] = [
  { value: 'Directo',    label: 'Directo y sin rodeos' },
  { value: 'Poético',    label: 'Reflexivo y pausado' },
  { value: 'Metafórico', label: 'Motivador y energético' },
];

const ENERGY_TYPES: { value: EnergyType; label: string }[] = [
  { value: 'Centrador', label: 'Centrador' },
  { value: 'Motivador', label: 'Motivador' },
  { value: 'Reflexivo', label: 'Reflexivo' },
  { value: 'Elevador',  label: 'Elevador' },
];

const LIFE_FOCUSES: { value: LifeFocus; label: string }[] = [
  { value: 'Carrera',              label: 'Carrera' },
  { value: 'Relaciones',           label: 'Relaciones' },
  { value: 'Crecimiento interior', label: 'Crecimiento interior' },
  { value: 'Salud',                label: 'Salud' },
  { value: 'Creatividad',          label: 'Creatividad' },
];

// ─── Definición de pasos ──────────────────────────────────────────────────────

type StepKey = 'languageStyle' | 'energy' | 'lifeFocus';

interface StepDef<T extends string = string> {
  key:      StepKey;
  heading:  string;
  subtitle: string;
  items:    { value: T; label: string }[];
}

const STEPS: StepDef[] = [
  {
    key:      'languageStyle',
    heading:  '¿Cómo prefieres\nque te hable?',
    subtitle: 'El estilo que más va contigo hoy.',
    items:    LANGUAGE_STYLES as { value: string; label: string }[],
  },
  {
    key:      'energy',
    heading:  '¿Qué energía quieres\nllevar hoy?',
    subtitle: 'El sentir que quieres a lo largo del día.',
    items:    ENERGY_TYPES as { value: string; label: string }[],
  },
  {
    key:      'lifeFocus',
    heading:  '¿En qué quieres\nenfocarte ahora?',
    subtitle: 'Hacia dónde apuntarán tus mensajes.',
    items:    LIFE_FOCUSES as { value: string; label: string }[],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const TonePreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const { tonePreferences, setTonePreference, setStep } = useOnboardingStore();
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];

  const currentValue = (): string | undefined => {
    if (step.key === 'languageStyle') return tonePreferences.languageStyle;
    if (step.key === 'energy')        return tonePreferences.energy;
    if (step.key === 'lifeFocus')     return tonePreferences.lifeFocus;
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const isComplete =
    tonePreferences.languageStyle &&
    tonePreferences.energy &&
    tonePreferences.lifeFocus;

  const handleSelect = (value: string) => {
    setTonePreference(step.key as any, value as any);
    if (!isLastStep) {
      // Pequeña pausa para que el usuario vea la selección antes de avanzar
      setTimeout(() => setCurrentStep(s => s + 1), 280);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleContinue = () => {
    setStep('complete');
    navigation.navigate('Welcome');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityLabel="Volver"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepCounter}>10 de {TOTAL}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Dots de progreso interno */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentStep && styles.dotActive,
                i < currentStep  && styles.dotDone,
              ]}
            />
          ))}
        </View>

        {/* Pregunta */}
        <Text style={styles.heading}>{step.heading}</Text>
        <Text style={styles.subtitle}>{step.subtitle}</Text>

        {/* Chips */}
        <View
          style={styles.chips}
          accessibilityRole="radiogroup"
          accessibilityLabel={step.heading}
        >
          {step.items.map(item => {
            const active = currentValue() === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[
                  chip.pill,
                  {
                    borderColor:     active ? ACCENT : colors.border,
                    backgroundColor: active ? ACCENT + '14' : 'transparent',
                  },
                ]}
                onPress={() => handleSelect(item.value)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityLabel={item.label}
                accessibilityState={{ checked: active }}
              >
                <Text style={[chip.text, { color: active ? ACCENT : colors.textSecondary }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Footer — solo visible en el último paso cuando está completo */}
      {isLastStep && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.ctaBtn, !isComplete && styles.ctaBtnDisabled]}
            onPress={handleContinue}
            disabled={!isComplete}
            activeOpacity={0.85}
            accessibilityLabel="Comenzar mi camino"
            accessibilityRole="button"
            accessibilityState={{ disabled: !isComplete }}
          >
            <Text style={styles.ctaBtnText}>Comenzar mi camino</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// ─── Chips ────────────────────────────────────────────────────────────────────

const chip = StyleSheet.create({
  pill: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },

  // ── Header ──────────────────────────────────────────────────────────────────
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

  // ── Content ─────────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  // Progress dots
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 36,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2A2A3A',
  },
  dotActive: {
    width: 20,
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  dotDone: {
    backgroundColor: ACCENT + '50',
  },

  // Heading
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
    marginBottom: 36,
  },

  // Chips container
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
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
  ctaBtnText: { color: '#1A2332', fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
});
