import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GradientBackground } from '../../components/GradientBackground';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useOnboardingStore } from '../../store/onboardingStore';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { ENNEAGRAM_TYPES } from '../../constants/enneagram';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingComplete'>;
};

export const OnboardingCompleteScreen: React.FC<Props> = ({ navigation }) => {
  const { birthData, enneagramType, tonePreferences } = useOnboardingStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const typeInfo = enneagramType ? ENNEAGRAM_TYPES[enneagramType] : null;

  const handleBegin = () => {
    // Navigate to the main app — for now just log
    // navigation.replace('MainApp')
    console.log('Onboarding complete. Navigating to main app...');
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.symbol}>◎</Text>
          <Text style={styles.title}>Your TAO is ready</Text>

          <View style={styles.summaryCard}>
            {birthData.locationName && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryIcon}>☽</Text>
                <View>
                  <Text style={styles.summaryLabel}>Born</Text>
                  <Text style={styles.summaryValue}>
                    {birthData.date} · {birthData.time} · {birthData.locationName}
                  </Text>
                </View>
              </View>
            )}
            {typeInfo && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryIcon}>◎</Text>
                <View>
                  <Text style={styles.summaryLabel}>Enneagram</Text>
                  <Text style={styles.summaryValue}>
                    Type {enneagramType} · {typeInfo.name}
                  </Text>
                </View>
              </View>
            )}
            {tonePreferences.spiritualTradition && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryIcon}>✦</Text>
                <View>
                  <Text style={styles.summaryLabel}>Voice</Text>
                  <Text style={styles.summaryValue}>
                    {tonePreferences.spiritualTradition} · {tonePreferences.languageStyle} · {tonePreferences.energy}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <Text style={styles.tagline}>
            Every morning, a quote composed just for you.
          </Text>
        </Animated.View>

        <PrimaryButton
          label="Reveal my first quote"
          onPress={handleBegin}
          style={styles.btn}
        />
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 80,
    paddingBottom: SPACING.xl,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  symbol: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: '200',
    color: COLORS.dark.text,
    marginBottom: SPACING.xl,
    letterSpacing: -1,
  },
  summaryCard: {
    backgroundColor: COLORS.dark.surface,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    borderRadius: 20,
    padding: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  summaryIcon: {
    fontSize: 18,
    color: '#C4B5FD',
    width: 24,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.dark.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.dark.text,
    fontWeight: '300',
  },
  tagline: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.dark.textSecondary,
    fontWeight: '300',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  btn: {
    width: '100%',
  },
});
