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
import {
  LanguageStyle,
  EnergyType,
  LifeFocus,
  TonePreferences,
} from '@/types';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'TonePreferences'>;
};

const TOTAL = 10;

const LANGUAGE_STYLES: { value: LanguageStyle; label: string }[] = [
  { value: 'Directo',    label: 'Directo y sin rodeos' },
  { value: 'Poético',    label: 'Reflexivo y pausado' },
  { value: 'Metafórico', label: 'Motivador y energético' },
];

const ENERGY_TYPES: { value: EnergyType }[] = [
  { value: 'Centrador' },
  { value: 'Motivador' },
  { value: 'Reflexivo' },
  { value: 'Elevador' },
];

const LIFE_FOCUSES: { value: LifeFocus }[] = [
  { value: 'Carrera' },
  { value: 'Relaciones' },
  { value: 'Crecimiento interior' },
  { value: 'Salud' },
  { value: 'Creatividad' },
];

interface ChipRowProps<T extends string> {
  label: string;
  subtitle?: string;
  items: { value: T; label?: string }[];
  selected: T | undefined;
  onSelect: (v: T) => void;
}

function ChipRow<T extends string>({ label, subtitle, items, selected, onSelect }: ChipRowProps<T>) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.label}>{label}</Text>
      {subtitle ? <Text style={sectionStyles.subtitle}>{subtitle}</Text> : null}
      <View style={sectionStyles.chips}>
        {items.map(item => {
          const active = selected === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[sectionStyles.chip, active && sectionStyles.chipActive]}
              onPress={() => onSelect(item.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={item.label ?? item.value}
              accessibilityState={{ checked: active }}
            >
              <Text style={[sectionStyles.chipText, active && sectionStyles.chipTextActive]}>
                {item.label ?? item.value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export const TonePreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const { tonePreferences, setTonePreference, setStep } = useOnboardingStore();

  const isComplete =
    tonePreferences.languageStyle &&
    tonePreferences.energy &&
    tonePreferences.lifeFocus;

  const handleContinue = () => {
    setStep('complete');
    navigation.navigate('Welcome');
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
        <Text style={styles.stepCounter}>10 de {TOTAL}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>¿Cómo prefieres{'\n'}que te hable?</Text>
        <Text style={styles.subtitle}>
          Puedes cambiarlo cuando quieras.
        </Text>

        <ChipRow<LanguageStyle>
          label="Estilo de lenguaje"
          subtitle="El estilo que más va contigo hoy."
          items={LANGUAGE_STYLES}
          selected={tonePreferences.languageStyle}
          onSelect={(v) => setTonePreference('languageStyle', v)}
        />

        <ChipRow<EnergyType>
          label="Energía"
          subtitle="El sentir que quieres llevar a lo largo del día"
          items={ENERGY_TYPES}
          selected={tonePreferences.energy}
          onSelect={(v) => setTonePreference('energy', v)}
        />

        <ChipRow<LifeFocus>
          label="Enfoque vital"
          subtitle="Hacia dónde quieres que apunten tus mensajes ahora"
          items={LIFE_FOCUSES}
          selected={tonePreferences.lifeFocus}
          onSelect={(v) => setTonePreference('lifeFocus', v)}
        />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaBtn, !isComplete && styles.ctaBtnDisabled]}
          onPress={handleContinue}
          disabled={!isComplete}
          activeOpacity={0.85}
          accessibilityLabel="Comenzar mi camino, continuar al siguiente paso"
          accessibilityRole="button"
          accessibilityState={{ disabled: !isComplete }}
        >
          <Text style={styles.ctaBtnText}>Comenzar mi camino</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: colors.fg.secondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.fg.secondary,
    marginBottom: 12,
    lineHeight: 21,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(116, 116, 128, 0.18)',
    height: 34,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipActive: {
    borderColor: '#FC8181',
  },
  chipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FC8181',
  },
});

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
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
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
    color: '#8A8A9A',
    lineHeight: 22,
    marginBottom: 36,
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
  ctaBtnDisabled: { opacity: 0.3 },
  ctaBtnText: { color: '#1A2332', fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
});
