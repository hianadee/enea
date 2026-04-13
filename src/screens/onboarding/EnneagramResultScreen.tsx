import React from 'react';
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
import { usePostHog } from 'posthog-react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { ENNEAGRAM_TYPES } from '@/constants/enneagram';
import { EnneagramType } from '@/types';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'EnneagramResult'>;
};

const TOTAL = 10;

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
        {/* Large type number */}
        <Text style={styles.typeLabel}>Tu tipo:</Text>
        <Text style={styles.typeNumber}>{enneagramType}</Text>
        <Text style={styles.typeName}>{typeInfo.name}</Text>
        <Text style={styles.typeTagline}>{typeInfo.tagline}</Text>

        <View style={styles.hairline} />

        <Text style={styles.typeDescription}>{typeInfo.description}</Text>

        {/* Change type section */}
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
          <Text style={styles.retakeBtnText} accessibilityElementsHidden={true}>Repetir el test</Text>
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
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backArrow: { color: colors.fg.primary, fontSize: 22 },
  headerSpacer: { width: 40 },
  stepCounter: {
    flex: 1,
    textAlign: 'center',
    color: colors.fg.secondary,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 14,
    color: '#A8A8B8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  typeNumber: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 96,
    color: '#FC8181',
    fontWeight: '200',
    lineHeight: 100,
    marginBottom: 8,
  },
  typeName: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    color: '#FC8181',
    fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
  },
  typeTagline: {
    fontSize: 14,
    color: '#FC8181',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
  },
  hairline: {
    width: 40,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#FC818130',
    marginBottom: 24,
  },
  typeDescription: {
    fontSize: 16,
    color: '#A8A8B8',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 40,
  },
  resonateLabel: {
    fontSize: 14,
    color: '#A8A8B8',
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
  typeChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FC8181',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipText: {
    color: '#FC8181',
    fontSize: 15,
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 10,
  },
  ctaBtn: {
    backgroundColor: colors.fg.primary,
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: { color: '#1A2332', fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  retakeBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeBtnText: {
    color: colors.fg.secondary,
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
