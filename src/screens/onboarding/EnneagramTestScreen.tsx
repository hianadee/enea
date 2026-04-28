import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FONT_FAMILY, TYPOGRAPHY } from '@/constants/theme';
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

  const [questionIndex, setQuestionIndex]     = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());
  const [scores, setScores] = useState<Scores>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  });

  const question  = ENNEAGRAM_QUESTIONS[questionIndex];
  const isLast    = questionIndex === ENNEAGRAM_QUESTIONS.length - 1;
  const progress  = (questionIndex + 1) / ENNEAGRAM_QUESTIONS.length;
  const hasSelection = selectedOptions.size > 0;

  const toggleOption = (i: number) => {
    setSelectedOptions(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleNext = () => {
    if (!hasSelection) return;

    // Sumar puntos de todas las opciones seleccionadas
    const newScores = { ...scores };
    selectedOptions.forEach(i => {
      question.options[i].types.forEach(t => {
        newScores[t] = (newScores[t] || 0) + 1;
      });
    });
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
      setSelectedOptions(new Set());
    }
  };

  const handleBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex(i => i - 1);
      setSelectedOptions(new Set());
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
          accessibilityLabel="Volver"
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
              El Eneagrama revela tu estructura de carácter más profunda. Responde con lo primero que sientas, sin pensarlo mucho.
            </Text>
          </>
        )}

        <Text style={styles.questionCount}>
          {questionIndex + 1} / {ENNEAGRAM_QUESTIONS.length}
        </Text>
        <Text style={styles.questionText}>{question.text}</Text>

        {/* Hint multiselección */}
        <Text style={styles.hint}>Puedes elegir más de una</Text>

        <View
          style={styles.options}
          accessibilityRole="menu"
          accessibilityLabel={question.text}
        >
          {question.options.map((option, i) => {
            const isSelected = selectedOptions.has(i);
            return (
              <TouchableOpacity
                key={i}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => toggleOption(i)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: isSelected }}
              >
                {/* Checkbox */}
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaBtn, !hasSelection && styles.ctaBtnDisabled]}
          onPress={handleNext}
          disabled={!hasSelection}
          activeOpacity={0.85}
          accessibilityLabel={isLast ? 'Ver mi tipo de eneagrama' : 'Siguiente pregunta'}
          accessibilityRole="button"
          accessibilityState={{ disabled: !hasSelection }}
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

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backBtn:      { width: 40, height: 44, justifyContent: 'center' },
  backArrow:    { color: '#F0EEF6', fontSize: 22 },
  headerSpacer: { width: 40 },
  stepCounter: {
    flex: 1,
    textAlign: 'center',
    color: '#8B8A9E',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // ── Progress ───────────────────────────────────────────────────────────────
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
    backgroundColor: '#F0EEF6',
    borderRadius: 1,
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
  },
  heading: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 28,
    color: '#F0EEF6',
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    ...TYPOGRAPHY.presets.bodyLg,
    color: '#8B8A9E',
    marginBottom: 28,
  },
  questionCount: {
    ...TYPOGRAPHY.presets.bodySm,
    color: '#8B8A9E',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  questionText: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 26,
    color: '#F0EEF6',
    lineHeight: 36,
    marginBottom: 10,
  },
  hint: {
    ...TYPOGRAPHY.presets.bodySm,
    color: '#5A5A6E',
    marginBottom: 24,
    fontStyle: 'italic',
  },

  // ── Options ────────────────────────────────────────────────────────────────
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2A2A3A',
    backgroundColor: '#111118',
  },
  optionSelected: {
    borderWidth: 1,
    borderColor: '#FC8181B3',
    backgroundColor: '#1A1118',
  },

  // Checkbox — cuadrado redondeado (vs radio circular)
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#3A3A4A',
    marginTop: 2,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#FC8181',
    backgroundColor: '#FC818130',
  },
  checkmark: {
    color: '#FC8181',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },

  optionText: {
    flex: 1,
    ...TYPOGRAPHY.presets.body,
    color: '#8B8A9E',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#F0EEF6',
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
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
