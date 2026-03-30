import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GradientBackground } from '../../components/GradientBackground';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useOnboardingStore } from '../../store/onboardingStore';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { ENNEAGRAM_QUESTIONS } from '../../constants/enneagram';
import { EnneagramType } from '../../types';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'EnneagramTest'>;
};

type Scores = Record<EnneagramType, number>;

export const EnneagramTestScreen: React.FC<Props> = ({ navigation }) => {
  const { setEnneagramType, setStep } = useOnboardingStore();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [scores, setScores] = useState<Scores>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  });

  const question = ENNEAGRAM_QUESTIONS[questionIndex];
  const isLast = questionIndex === ENNEAGRAM_QUESTIONS.length - 1;
  const progress = (questionIndex + 1) / ENNEAGRAM_QUESTIONS.length;

  const handleSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    // Tally scores
    const option = question.options[selectedOption];
    const newScores = { ...scores };
    option.types.forEach((t) => {
      newScores[t] = (newScores[t] || 0) + 1;
    });
    setScores(newScores);

    if (isLast) {
      // Find winning type
      const winnerType = (Object.keys(newScores) as unknown as EnneagramType[]).reduce(
        (a, b) => (newScores[a] >= newScores[b] ? a : b)
      );
      setEnneagramType(winnerType);
      setStep('enneagram_result');
      navigation.navigate('EnneagramResult');
    } else {
      setQuestionIndex((i) => i + 1);
      setSelectedOption(null);
    }
  };

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <TouchableOpacity
            onPress={() => {
              if (questionIndex > 0) {
                setQuestionIndex((i) => i - 1);
                setSelectedOption(null);
              } else {
                navigation.goBack();
              }
            }}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {questionIndex + 1}/{ENNEAGRAM_QUESTIONS.length}
          </Text>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.text}</Text>
        </View>

        <View style={styles.options}>
          {question.options.map((option, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.option,
                selectedOption === i && styles.optionSelected,
              ]}
              onPress={() => handleSelect(i)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionDot,
                  selectedOption === i && styles.optionDotSelected,
                ]}
              />
              <Text
                style={[
                  styles.optionText,
                  selectedOption === i && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          label={isLast ? 'See my type' : 'Next question'}
          onPress={handleNext}
          disabled={selectedOption === null}
          style={styles.nextBtn}
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
    flexGrow: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING['3xl'],
  },
  backArrow: {
    color: COLORS.dark.textSecondary,
    fontSize: TYPOGRAPHY.sizes.xl,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.dark.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C4B5FD',
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.dark.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    minWidth: 28,
    textAlign: 'right',
  },
  questionContainer: {
    marginBottom: SPACING['2xl'],
  },
  questionText: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '300',
    color: COLORS.dark.text,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  options: {
    flex: 1,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.dark.surface,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    borderRadius: 14,
    padding: SPACING.md,
  },
  optionSelected: {
    borderColor: '#C4B5FD',
    backgroundColor: 'rgba(196, 181, 253, 0.08)',
  },
  optionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.dark.border,
    marginTop: 1,
    flexShrink: 0,
  },
  optionDotSelected: {
    borderColor: '#C4B5FD',
    backgroundColor: '#C4B5FD',
  },
  optionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.dark.textSecondary,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: COLORS.dark.text,
  },
  nextBtn: {
    width: '100%',
  },
});
