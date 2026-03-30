import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GradientBackground } from '../../components/GradientBackground';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StepIndicator } from '../../components/StepIndicator';
import { useOnboardingStore } from '../../store/onboardingStore';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Birth'>;
};

export const BirthDataScreen: React.FC<Props> = ({ navigation }) => {
  const { setBirthData, setStep } = useOnboardingStore();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  const isValid =
    date.length === 10 && time.length === 5 && location.trim().length > 0;

  const handleContinue = () => {
    // Basic validation
    const [year, month, day] = date.split('-').map(Number);
    if (
      !year || year < 1900 || year > 2025 ||
      !month || month < 1 || month > 12 ||
      !day || day < 1 || day > 31
    ) {
      Alert.alert('Invalid date', 'Please enter a valid date (YYYY-MM-DD)');
      return;
    }

    setBirthData({
      date,
      time,
      locationName: location,
      // Coordinates would come from geocoding — placeholder for now
      latitude: 0,
      longitude: 0,
    });
    setStep('enneagram_intro');
    navigation.navigate('EnneagramIntro');
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <StepIndicator total={3} current={0} />
            <Text style={styles.stepLabel}>Step 1 of 3</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.symbol}>☽</Text>
            <Text style={styles.title}>Your birth details</Text>
            <Text style={styles.subtitle}>
              Your natal chart is the map of the sky at the moment you arrived.
              The more precise, the deeper your insights.
            </Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Date of birth</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={(t) => {
                    // Auto-format YYYY-MM-DD
                    const cleaned = t.replace(/[^0-9]/g, '');
                    let formatted = cleaned;
                    if (cleaned.length >= 5) {
                      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    }
                    if (cleaned.length >= 7) {
                      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 6) + '-' + cleaned.slice(6, 8);
                    }
                    setDate(formatted);
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.dark.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Time of birth</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={(t) => {
                    const cleaned = t.replace(/[^0-9]/g, '');
                    let formatted = cleaned;
                    if (cleaned.length >= 3) {
                      formatted = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
                    }
                    setTime(formatted);
                  }}
                  placeholder="HH:MM (24h)"
                  placeholderTextColor={COLORS.dark.textMuted}
                  keyboardType="number-pad"
                  maxLength={5}
                  returnKeyType="next"
                />
                <Text style={styles.fieldHint}>Use your local birth time. "Unknown" → enter 12:00</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Place of birth</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="City, Country"
                  placeholderTextColor={COLORS.dark.textMuted}
                  returnKeyType="done"
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              label="Continue"
              onPress={handleContinue}
              disabled={!isValid}
            />
            <Text style={styles.privacy}>
              Your data is private and never sold.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
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
  content: {
    flex: 1,
    marginBottom: SPACING.xl,
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
  form: {
    gap: SPACING.lg,
  },
  field: {
    gap: SPACING.xs,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.dark.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.dark.surface,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.dark.text,
    fontSize: TYPOGRAPHY.sizes.lg,
    letterSpacing: 0.5,
  },
  fieldHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.dark.textMuted,
  },
  footer: {
    gap: SPACING.md,
    alignItems: 'center',
  },
  privacy: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.dark.textMuted,
  },
});
