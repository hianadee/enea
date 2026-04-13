import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing } from '@/design-system/tokens';
import { Button, Card, Input } from '@/design-system/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePostHog } from 'posthog-react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'FirstName'>;
};

const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';
const TOTAL = 10;

export const FirstNameScreen: React.FC<Props> = ({ navigation }) => {
  const { setFirstName, setStep } = useOnboardingStore();
  const posthog = usePostHog();
  const [name, setName] = useState('');

  const isValid = name.trim().length > 0;

  const handleContinue = () => {
    if (!isValid) return;
    setFirstName(name.trim());
    posthog?.capture('onboarding_name_entered');
    setStep('birth_date');
    navigation.navigate('BirthDate');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.stepCounter}>1 de {TOTAL}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.heading}>¿Cómo te llamas?</Text>
          <Text style={styles.subheading}>Así sabré cómo dirigirme a ti.</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor="#444444"
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
            keyboardType="default"
            textContentType="name"
            returnKeyType="done"
            maxLength={50}
            onSubmitEditing={handleContinue}
            accessibilityLabel="Tu nombre"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.ctaBtn, !isValid && styles.ctaBtnDisabled]}
            onPress={handleContinue}
            disabled={!isValid}
            activeOpacity={0.85}
            accessibilityLabel="Continuar al siguiente paso"
            accessibilityRole="button"
            accessibilityState={{ disabled: !isValid }}
          >
            <Text style={styles.ctaBtnText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerSpacer: {
    width: 40,
  },
  stepCounter: {
    flex: 1,
    textAlign: 'center',
    color: colors.fg.secondary,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  heading: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 34,
    color: colors.fg.primary,
    lineHeight: 44,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#A8A8B8',
    lineHeight: 24,
    marginBottom: 44,
  },
  input: {
    fontSize: 28,
    color: colors.fg.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 0,
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
  ctaBtnDisabled: {
    opacity: 0.3,
  },
  ctaBtnText: {
    color: colors.bg.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
