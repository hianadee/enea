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
import { ENNEAGRAM_QUESTIONS } from '@/constants/enneagram';
import { EnneagramType } from '@/types';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'EnneagramTest'>;
};

type Scores = Record<EnneagramType, number>;

const TOTAL = 10;

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

  const handleNext = () => {
    if (selectedOption === null) return;

    const option = question.options[selectedOption];
    const newScores = { ...scores };
    option.types.forEach((t) => { newScores[t] = (newScores[t] || 0) + 1; });
    setScores(newScores);

    if (isLast) {
      const winner = (Object.keys(newScores) as unknown as EnneagramType[]).reduce(
        (a, b) => (newScores[a] >= newScores[b] ? a : b),
      );
      setEnneagramType(winner);
      setStep('enneagram_result');
      navigation.navigate('EnneagramResult');
    } else {
      setQuestionIndex(i => i + 1);
      setSelectedOption(null);
    }
  };

  const handleBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex(i => i - 1);
      setSelectedOption(null);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityLabel="Volver a la pantalla anterior"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepCounter}>7 de {TOTAL}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {questionIndex === 0 && (
          <>
            <Text style={styles.heading}>Unas preguntas para{'\n'}conocerte mejor</Text>
            <Text style={styles.subtitle}>
              El Eneagrama describe nueve formas de ver el mundo. Responde con lo primero que sientas, sin pensarlo mucho.
            </Text>
          </>
        )}
        <Text style={styles.questionCount}>
          {questionIndex + 1} / {ENNEAGRAM_QUESTIONS.length}
        </Text>
        <Text style={styles.questionText}>{question.text}</Text>

        <View style={styles.options}>
          {question.options.map((option, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.option, selectedOption === i && styles.optionSelected]}
              onPress={() => setSelectedOption(i)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: selectedOption === i }}
            >
              <View style={[styles.dot, selectedOption === i && styles.dotSelected]} />
              <Text style={[styles.optionText, selectedOption === i && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaBtn, selectedOption === null && styles.ctaBtnDisabled]}
          onPress={handleNext}
          disabled={selectedOption === null}
          activeOpacity={0.85}
          accessibilityLabel={isLast ? 'Ver mi tipo de eneagrama' : 'Siguiente pregunta'}
          accessibilityRole="button"
          accessibilityState={{ disabled: selectedOption === null }}
        >
          <Text style={styles.ctaBtnText}>
            {isLast ? 'Ver mi tipo' : 'Siguiente'}
          </Text>
        </TouchableOpacity>
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
  progressBar: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: 1,
    backgroundColor: colors.fg.primary,
    borderRadius: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
  },
  heading: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    color: colors.fg.primary,
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#A8A8B8',
    lineHeight: 22,
    marginBottom: 28,
  },
  questionCount: {
    fontSize: 14,
    color: '#A8A8B8',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  questionText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 26,
    color: colors.fg.primary,
    lineHeight: 36,
    marginBottom: 32,
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    backgroundColor: '#080808',
  },
  optionSelected: {
    borderColor: '#3A3A3A',
    backgroundColor: '#111111',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#FC8181B3',
    marginTop: 2,
    flexShrink: 0,
  },
  dotSelected: {
    borderColor: '#FC8181E6',
    backgroundColor: '#FC8181E6',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#A8A8B8',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: colors.fg.primary,
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
