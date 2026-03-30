import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GradientBackground } from '../../components/GradientBackground';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StepIndicator } from '../../components/StepIndicator';
import { useOnboardingStore } from '../../store/onboardingStore';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { ENNEAGRAM_TYPES } from '../../constants/enneagram';
import { EnneagramType } from '../../types';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'EnneagramIntro'>;
};

export const EnneagramIntroScreen: React.FC<Props> = ({ navigation }) => {
  const { setEnneagramType, setStep } = useOnboardingStore();

  const handleSelectType = (type: EnneagramType) => {
    setEnneagramType(type);
    setStep('enneagram_result');
    navigation.navigate('EnneagramResult');
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <StepIndicator total={3} current={1} />
          <Text style={styles.stepLabel}>Step 2 of 3</Text>
        </View>

        <Text style={styles.symbol}>◎</Text>
        <Text style={styles.title}>Your inner type</Text>
        <Text style={styles.subtitle}>
          The Enneagram reveals your core motivations and fears.
          Know your type — or take a short test to find it.
        </Text>

        <PrimaryButton
          label="Take the short test (5 questions)"
          onPress={() => {
            setStep('enneagram_test');
            navigation.navigate('EnneagramTest');
          }}
          style={styles.primaryBtn}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or select yours</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.typeGrid}>
          {(Object.keys(ENNEAGRAM_TYPES) as unknown as EnneagramType[]).map((type) => {
            const info = ENNEAGRAM_TYPES[type];
            return (
              <TouchableOpacity
                key={type}
                style={styles.typeCard}
                onPress={() => handleSelectType(type)}
                activeOpacity={0.7}
              >
                <Text style={styles.typeNumber}>{type}</Text>
                <Text style={styles.typeName}>{info.name}</Text>
                <Text style={styles.typeTagline}>{info.tagline}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

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
    marginBottom: SPACING.xl,
  },
  primaryBtn: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
    gap: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.dark.border,
  },
  dividerText: {
    color: COLORS.dark.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  typeGrid: {
    gap: SPACING.sm,
  },
  typeCard: {
    backgroundColor: COLORS.dark.surface,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    borderRadius: 14,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  typeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.dark.surfaceElevated,
    color: '#C4B5FD',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    overflow: 'hidden',
  },
  typeName: {
    flex: 1,
    color: COLORS.dark.text,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
  },
  typeTagline: {
    flex: 2,
    color: COLORS.dark.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
