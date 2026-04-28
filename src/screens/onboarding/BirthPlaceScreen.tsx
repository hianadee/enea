import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing } from '@/design-system/tokens';
import { FONT_FAMILY } from '@/constants/theme';
import { Button, Card, Input } from '@/design-system/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePostHog } from 'posthog-react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'BirthPlace'>;
};

interface PlaceResult {
  name: string;
  lat: number;
  lon: number;
  state?: string;
  country?: string;
}

const TOTAL = 10;

function formatPlace(result: PlaceResult): string {
  const parts = [result.name, result.state, result.country].filter(Boolean);
  return parts.join(', ');
}

export const BirthPlaceScreen: React.FC<Props> = ({ navigation }) => {
  const { setBirthData, setStep } = useOnboardingStore();
  const posthog = usePostHog();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PlaceResult | null>(null);
  const [error, setError] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (text: string) => {
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=6&layer=city&layer=locality`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      const data: PlaceResult[] = (json.features ?? []).map((f: any) => ({
        name: f.properties.name ?? '',
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        state: f.properties.state,
        country: f.properties.country,
      }));
      setResults(data);
    } catch {
      setError('No se pudo buscar. Comprueba tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 350);
  };

  const handleSelect = (place: PlaceResult) => {
    setSelected(place);
    setQuery(formatPlace(place));
    setResults([]);
  };

  const handleContinue = () => {
    if (!selected) return;
    setBirthData({
      latitude: selected.lat,
      longitude: selected.lon,
      locationName: formatPlace(selected),
    });
    posthog?.capture('onboarding_birth_place_set');
    setStep('birth_time');
    navigation.navigate('BirthTime');
  };

  const isValid = selected !== null;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityLabel="Volver a la pantalla anterior"
            accessibilityRole="button"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.stepCounter}>3 de {TOTAL}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.heading}>¿En qué lugar naciste?</Text>
          <Text style={styles.helper}>El lugar importa. Determina la posición exacta de los astros en ese momento.</Text>

          {/* Search input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ciudad, País"
              placeholderTextColor="#444444"
              value={query}
              onChangeText={handleChangeText}
              autoFocus
              autoCapitalize="words"
              textContentType="addressCity"
              returnKeyType="search"
              maxLength={100}
              accessibilityLabel="Ciudad de nacimiento"
            />
            {loading && (
              <ActivityIndicator color="#555555" size="small" style={styles.spinner} />
            )}
          </View>

          {error ? (
            <Text
              style={styles.errorText}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
            >
              {error}
            </Text>
          ) : null}

          {/* Results list */}
          {results.length > 0 && (
            <FlatList
              data={results}
              keyExtractor={(_, i) => String(i)}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar ${formatPlace(item)}`}
                >
                  <Text style={styles.resultText} numberOfLines={2}>
                    {formatPlace(item)}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
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
  backBtn: {
    width: 40,
    height: 44,
    justifyContent: 'center',
  },
  backArrow: {
    color: colors.fg.primary,
    fontSize: 22,
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
    fontFamily: FONT_FAMILY.serif,
    fontSize: 32,
    color: colors.fg.primary,
    lineHeight: 42,
    marginBottom: 8,
  },
  helper: {
    fontSize: 16,
    color: '#A8A8B8',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 36,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 22,
    color: colors.fg.primary,
    paddingVertical: 12,
  },
  spinner: {
    marginLeft: 8,
  },
  errorText: {
    color: '#8A8A9A',
    fontSize: 14,
    marginTop: 8,
  },
  resultsList: {
    marginTop: 8,
    maxHeight: 300,
  },
  resultItem: {
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  resultText: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: '#1A1A1A',
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
