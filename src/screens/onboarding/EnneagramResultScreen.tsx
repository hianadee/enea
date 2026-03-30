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
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'EnneagramResult'>;
};

export const EnneagramResultScreen: React.FC<Props> = ({ navigation }) => {
  const { enneagramType, setEnneagramType, setStep } = useOnboardingStore();

  if (!enneagramType) return null;

  const typeInfo = ENNEAGRAM_TYPES[enneagramType];

  const handleContinue = () => {
    setStep('tone');
    navigation.navigate('TonePreferences');
  };

  const otherTypes = (Object.keys(ENNEAGRAM_TYPES) as unknown as EnneagramType[]).filter(
    (t) => t !== enneagramType
  );

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <StepIndicator total={3} current={1} />
          <Text style={styles.stepLabel}>Step 2 of 3</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.typeNumber}>{enneagramType}</Text>
          <Text style={styles.typeName}>{typeInfo.name}</Text>
          <Text style={styles.typeTagline}>{typeInfo.tagline}</Text>
          <View style={styles.divider} />
          <Text style={styles.typeDescription}>{typeInfo.description}</Text>
        </View>

        <Text style={styles.resonateQuestion}>Does this resonate?</Text>

        <View style={styles.changeTypeContainer}>
          <Text style={styles.changeTypeLabel}>Choose a different type</Text>
          <View style={styles.typeChips}>
            {otherTypes.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.typeChip}
                onPress={() => setEnneagramType(t)}
                activeOpacity={0.7}
              >
                <Text style={styles.typeChipText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <PrimaryButton
          label="Yes, this is me"
          onPress={handleContinue}
          style={styles.continueBtn}
        />
        <PrimaryButton
          label="Retake the test"
          onPress={() => navigation.navigate('EnneagramTest')}
          variant="ghost"
          style={styles.retakeBtn}
        />
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
  resultCard: {
    backgroundColor: COLORS.dark.surface,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.3)',
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  typeNumber: {
    fontSize: 72,
    fontWeight: '100',
    color: '#C4B5FD',
    lineHeight: 80,
    marginBottom: SPACING.xs,
  },
  typeName: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '300',
    color: COLORS.dark.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  typeTagline: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.dark.border,
    marginVertical: SPACING.md,
  },
  typeDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.dark.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  resonateQuestion: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.dark.text,
    fontWeight: '300',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  changeTypeContainer: {
    marginBottom: SPACING.xl,
  },
  changeTypeLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.dark.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  typeChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.dark.surface,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipText: {
    color: COLORS.dark.textSecondary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
  },
  continueBtn: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  retakeBtn: {
    width: '100%',
  },
});
