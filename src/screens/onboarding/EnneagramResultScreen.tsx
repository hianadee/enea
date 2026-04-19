import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePostHog } from 'posthog-react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { ENNEAGRAM_TYPES } from '@/constants/enneagram';
import { TYPOGRAPHY, FONT_FAMILY } from '@/constants/theme';
import { EnneagramType } from '@/types';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'EnneagramResult'>;
};

const TOTAL  = 10;
const ACCENT = '#FC8181';

export const EnneagramResultScreen: React.FC<Props> = ({ navigation }) => {
  const { enneagramType, setEnneagramType, setStep } = useOnboardingStore();
  const posthog = usePostHog();

  if (!enneagramType) return null;

  const typeInfo = ENNEAGRAM_TYPES[enneagramType];

  const handleContinue = () => {
    posthog?.capture('onboarding_enneagram_result_seen', { type: enneagramType });
    setStep('religion');
    navigation.navigate('Religion');
  };

  const otherTypes = (Object.keys(ENNEAGRAM_TYPES) as unknown as EnneagramType[]).filter(
    t => t !== enneagramType,
  );

  return (
    <SafeAreaView style={styles.safe}>
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
        <Text style={styles.stepCounter}>7 de {TOTAL}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Número héroe */}
        <Text style={styles.typeLabel}>Tu tipo:</Text>
        <Text style={styles.typeNumber}>{enneagramType}</Text>
        <Text style={styles.typeName}>{typeInfo.name}</Text>

        {/* Pasión · Fijación — en text, no en ACCENT */}
        <Text style={styles.typeTagline}>{typeInfo.tagline}</Text>

        <View style={styles.hairline} />

        {/* Descripción */}
        <Text style={styles.typeDescription}>{typeInfo.description}</Text>

        {/* Selector de otro tipo */}
        <Text style={styles.resonateLabel}>¿No te resuena? Elige otro tipo:</Text>
        <View style={styles.typeChips}>
          {otherTypes.map(t => (
            <TouchableOpacity
              key={t}
              style={styles.typeChip}
              onPress={() => setEnneagramType(t)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Elegir tipo ${t}: ${ENNEAGRAM_TYPES[t].name}`}
            >
              <Text style={styles.typeChipText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
          accessibilityLabel="Sí, me reconozco, continuar al siguiente paso"
          accessibilityRole="button"
        >
          <Text style={styles.ctaBtnText}>Sí, me reconozco</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.retakeBtn}
          onPress={() => navigation.navigate('EnneagramTest')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Repetir el test"
        >
          <Text style={styles.retakeBtnText}>Repetir el test</Text>
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

  // ── Header ────────────────────────────────────────────────────────────────────
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backBtn:       { width: 44, height: 44, justifyContent: 'center' },
  backArrow:     { color: '#F0EEF6', fontSize: 22 },
  headerSpacer:  { width: 40 },
  stepCounter: {
    flex: 1,
    textAlign: 'center',
    color: '#8B8A9E',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },

  // ── Hero ──────────────────────────────────────────────────────────────────────
  typeLabel: {
    ...TYPOGRAPHY.presets.label,
    color: '#8B8A9E',
    marginBottom: 4,
  },
  typeNumber: {
    ...TYPOGRAPHY.presets.display,
    color: ACCENT,
    lineHeight: 104,
    marginBottom: 8,
  },
  typeName: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 28,
    color: ACCENT,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Pasión · Fijación — texto primario, no ACCENT
  typeTagline: {
    ...TYPOGRAPHY.presets.bodySm,
    color: '#F0EEF6',
    textAlign: 'center',
    marginBottom: 24,
  },

  hairline: {
    width: 40,
    height: StyleSheet.hairlineWidth,
    backgroundColor: ACCENT + '30',
    marginBottom: 24,
  },

  // ── Descripción ───────────────────────────────────────────────────────────────
  typeDescription: {
    ...TYPOGRAPHY.presets.bodyLg,
    color: '#8B8A9E',
    textAlign: 'center',
    marginBottom: 40,
  },

  // ── Selector de tipo ──────────────────────────────────────────────────────────
  resonateLabel: {
    ...TYPOGRAPHY.presets.bodySm,
    color: '#8B8A9E',
    marginBottom: 16,
    textAlign: 'center',
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  // Círculo — mismo spec que EnneagramIntroScreen
  typeChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#FC8181B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipText: {
    color: '#FC8181E6',
    fontSize: 15,
    fontWeight: '500',
  },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 10,
  },
  ctaBtn: {
    backgroundColor: '#F0EEF6',
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText:   { color: '#1A2332', fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  retakeBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeBtnText: {
    ...TYPOGRAPHY.presets.bodySm,
    color: '#8B8A9E',
    letterSpacing: 0.2,
  },
});
