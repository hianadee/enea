import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '@/design-system/tokens';
import { Button, Card, Input } from '@/design-system/components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GradientBackground } from '@/design-system/components/GradientBackground';
import { PrimaryButton } from '@/design-system/components/PrimaryButton';
import { StepIndicator } from '@/design-system/components/StepIndicator';
import { useOnboardingStore } from '@/store/onboardingStore';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { OnboardingStackParamList } from '@/navigation/types';
import { geocodeLocation } from '@/utils/astroUtils';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'FirstName'>;
};

export const BirthDataScreen: React.FC<Props> = ({ navigation }) => {
  const { setBirthData, setStep } = useOnboardingStore();

  const [date, setDate]       = useState('');
  const [time, setTime]       = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid =
    date.length === 10 && time.length === 5 && location.trim().length > 0;

  const handleContinue = async () => {
    const [year, month, day] = date.split('-').map(Number);
    if (
      !year || year < 1900 || year > 2030 ||
      !month || month < 1 || month > 12 ||
      !day || day < 1 || day > 31
    ) {
      Alert.alert('Fecha inválida', 'Por favor ingresa una fecha válida (AAAA-MM-DD)');
      return;
    }

    setLoading(true);
    try {
      const coords = await geocodeLocation(location.trim());
      const lat = coords?.lat ?? 0;
      const lng = coords?.lng ?? 0;

      if (!coords) {
        Alert.alert(
          'Lugar no encontrado',
          'No pudimos ubicar ese lugar. Usaremos coordenadas aproximadas. Puedes continuar.',
          [{ text: 'Continuar', onPress: () => proceed(lat, lng) }],
        );
      } else {
        proceed(lat, lng);
      }
    } finally {
      setLoading(false);
    }
  };

  const proceed = (lat: number, lng: number) => {
    setBirthData({
      date,
      time,
      locationName: location.trim(),
      latitude:  lat,
      longitude: lng,
    });
    setStep('natal_chart');
    navigation.navigate('NatalChartPreview');
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
            <StepIndicator total={4} current={0} />
            <Text style={styles.stepLabel}>Paso 1 de 4</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.symbol}>☽</Text>
            <Text style={styles.title}>Tu fecha de nacimiento</Text>
            <Text style={styles.subtitle}>
              Tu carta natal es el mapa del cielo en el momento en que llegaste.
              Cuanto más precisa, más profundos tus mensajes.
            </Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Fecha de nacimiento</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={(t) => {
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
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor={COLORS.dark.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Hora de nacimiento</Text>
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
                <Text style={styles.fieldHint}>
                  Usa tu hora local de nacimiento. Si no la sabes, ingresa 12:00
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Lugar de nacimiento</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Ciudad, País"
                  placeholderTextColor={COLORS.dark.textMuted}
                  returnKeyType="done"
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            {loading ? (
              <ActivityIndicator color={COLORS.dark.text} size="small" />
            ) : (
              <PrimaryButton
                label="Continuar"
                onPress={handleContinue}
                disabled={!isValid}
              />
            )}
            <Text style={styles.privacy}>
              Tus datos son privados y nunca se venden.
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
    fontSize: 16,
    color: COLORS.dark.textSecondary,
    lineHeight: 22,
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
    minHeight: 60,
    justifyContent: 'center',
  },
  privacy: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.dark.textMuted,
  },
});
