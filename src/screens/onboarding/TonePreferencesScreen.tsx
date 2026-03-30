import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GradientBackground } from '../../components/GradientBackground';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StepIndicator } from '../../components/StepIndicator';
import { useOnboardingStore } from '../../store/onboardingStore';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import {
  SpiritualTradition,
  LanguageStyle,
  EnergyType,
  LifeFocus,
  TonePreferences,
} from '../../types';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'TonePreferences'>;
};

const SPIRITUAL_TRADITIONS: SpiritualTradition[] = [
  'Buddhist', 'Stoic', 'Christian', 'Hindu', 'Secular', 'Taoist', 'Islamic', 'Jewish',
];

const LANGUAGE_STYLES: { value: LanguageStyle; emoji: string; desc: string }[] = [
  { value: 'Poetic', emoji: '✦', desc: 'Lyrical and evocative' },
  { value: 'Direct', emoji: '→', desc: 'Clear and actionable' },
  { value: 'Metaphorical', emoji: '◉', desc: 'Rich in imagery' },
  { value: 'Scientific', emoji: '⬡', desc: 'Grounded in evidence' },
];

const ENERGY_TYPES: { value: EnergyType; emoji: string }[] = [
  { value: 'Grounding', emoji: '⬇' },
  { value: 'Motivating', emoji: '↑' },
  { value: 'Reflective', emoji: '◌' },
  { value: 'Uplifting', emoji: '☀' },
];

const LIFE_FOCUSES: { value: LifeFocus; emoji: string }[] = [
  { value: 'Career', emoji: '◈' },
  { value: 'Relationships', emoji: '◎' },
  { value: 'Inner growth', emoji: '◑' },
  { value: 'Health', emoji: '◉' },
  { value: 'Creativity', emoji: '✦' },
];

type SectionKey = keyof TonePreferences;

interface SectionProps<T> {
  title: string;
  subtitle?: string;
  items: { value: T; emoji?: string; desc?: string }[];
  selected: T | undefined;
  onSelect: (v: T) => void;
}

function SelectionRow<T extends string>({
  title,
  subtitle,
  items,
  selected,
  onSelect,
}: SectionProps<T>) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      {subtitle && <Text style={sectionStyles.subtitle}>{subtitle}</Text>}
      <View style={sectionStyles.chips}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              sectionStyles.chip,
              selected === item.value && sectionStyles.chipSelected,
            ]}
            onPress={() => onSelect(item.value)}
            activeOpacity={0.7}
          >
            {item.emoji && (
              <Text style={sectionStyles.chipEmoji}>{item.emoji}</Text>
            )}
            <Text
              style={[
                sectionStyles.chipText,
                selected === item.value && sectionStyles.chipTextSelected,
              ]}
            >
              {item.value}
            </Text>
            {item.desc && selected === item.value && (
              <Text style={sectionStyles.chipDesc}>{item.desc}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export const TonePreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const { tonePreferences, setTonePreference, setStep } = useOnboardingStore();

  const isComplete =
    tonePreferences.spiritualTradition &&
    tonePreferences.languageStyle &&
    tonePreferences.energy &&
    tonePreferences.lifeFocus;

  const handleContinue = () => {
    setStep('complete');
    navigation.navigate('OnboardingComplete');
  };

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <StepIndicator total={3} current={2} />
          <Text style={styles.stepLabel}>Step 3 of 3</Text>
        </View>

        <Text style={styles.symbol}>✦</Text>
        <Text style={styles.title}>Shape your voice</Text>
        <Text style={styles.subtitle}>
          Your quotes will be composed in a tone that resonates with who you are.
        </Text>

        <View style={styles.sections}>
          <SelectionRow<SpiritualTradition>
            title="Spiritual tradition"
            subtitle="The wisdom lineage your quotes draw from"
            items={SPIRITUAL_TRADITIONS.map((v) => ({ value: v }))}
            selected={tonePreferences.spiritualTradition}
            onSelect={(v) => setTonePreference('spiritualTradition', v)}
          />

          <SelectionRow<LanguageStyle>
            title="Language style"
            items={LANGUAGE_STYLES}
            selected={tonePreferences.languageStyle}
            onSelect={(v) => setTonePreference('languageStyle', v)}
          />

          <SelectionRow<EnergyType>
            title="Energy"
            subtitle="The feeling you want to carry through the day"
            items={ENERGY_TYPES}
            selected={tonePreferences.energy}
            onSelect={(v) => setTonePreference('energy', v)}
          />

          <SelectionRow<LifeFocus>
            title="Life focus"
            subtitle="Where you want your insights directed right now"
            items={LIFE_FOCUSES}
            selected={tonePreferences.lifeFocus}
            onSelect={(v) => setTonePreference('lifeFocus', v)}
          />
        </View>

        <PrimaryButton
          label="Begin my journey"
          onPress={handleContinue}
          disabled={!isComplete}
          style={styles.continueBtn}
        />
      </ScrollView>
    </GradientBackground>
  );
};

const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.dark.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.dark.textMuted,
    marginBottom: SPACING.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    backgroundColor: COLORS.dark.surface,
  },
  chipSelected: {
    borderColor: '#C4B5FD',
    backgroundColor: 'rgba(196, 181, 253, 0.1)',
  },
  chipEmoji: {
    fontSize: 13,
    color: COLORS.dark.textMuted,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.dark.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#C4B5FD',
  },
  chipDesc: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.dark.textMuted,
    marginLeft: 2,
  },
});

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING['2xl'],
  },
  stepLabel: {
    color: COLORS.dark.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  symbol: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: '300',
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.dark.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING['2xl'],
  },
  sections: {
    marginBottom: SPACING.xl,
  },
  continueBtn: {
    width: '100%',
  },
});
