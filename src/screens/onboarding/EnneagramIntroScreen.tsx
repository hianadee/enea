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
import { useOnboardingStore } from '@/store/onboardingStore';
import { ENNEAGRAM_TYPES } from '@/constants/enneagram';
import { EnneagramType } from '@/types';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'EnneagramIntro'>;
};

const TOTAL = 10;

export const EnneagramIntroScreen: React.FC<Props> = ({ navigation }) => {
  const { setEnneagramType, setStep } = useOnboardingStore();

  const handleSelectType = (type: EnneagramType) => {
    setEnneagramType(type);
    setStep('enneagram_result');
    navigation.navigate('EnneagramResult');
  };

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
        <Text style={styles.heading}>Unas preguntas{'\n'}para conocerte mejor</Text>
        <Text style={styles.subtitle}>
          El Eneagrama describe nueve formas de ver el mundo. Responde con lo primero que sientas, sin pensarlo mucho.
        </Text>

        {/* CTA: take test */}
        <TouchableOpacity
          style={styles.testBtn}
          onPress={() => {
            setStep('enneagram_test');
            navigation.navigate('EnneagramTest');
          }}
          activeOpacity={0.85}
          accessibilityLabel="Hacer el test de eneagrama, 5 preguntas"
          accessibilityRole="button"
        >
          <Text style={styles.testBtnText}>Hacer el test</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Ya sé mi tipo</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Type list */}
        <View style={styles.typeGrid}>
          {(Object.keys(ENNEAGRAM_TYPES) as unknown as EnneagramType[]).map((type) => {
            const info = ENNEAGRAM_TYPES[type];
            return (
              <TouchableOpacity
                key={type}
                style={styles.typeRow}
                onPress={() => handleSelectType(type)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Tipo ${type}: ${info.name}. ${info.tagline}`}
              >
                <View style={styles.typeNumCircle}>
                  <Text style={styles.typeNum}>{type}</Text>
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>{info.name}</Text>
                  <Text style={styles.typeTagline} numberOfLines={1}>{info.tagline}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  heading: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 34,
    color: colors.fg.primary,
    lineHeight: 44,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#A8A8B8',
    lineHeight: 22,
    marginBottom: 32,
  },
  testBtn: {
    backgroundColor: colors.fg.primary,
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  testBtnText: {
    color: '#1A2332',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: '#A8A8B8',
    fontSize: 14,
  },
  typeGrid: {
    gap: 2,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1A1A1A',
    gap: 14,
  },
  typeNumCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#FC8181B3',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  typeNum: {
    color: '#FC8181E6',
    fontSize: 15,
    fontWeight: '500',
  },
  typeInfo: {
    flex: 1,
    gap: 2,
  },
  typeName: {
    color: colors.fg.primary,
    fontSize: 15,
    fontWeight: '400',
  },
  typeTagline: {
    color: '#A8A8B8',
    fontSize: 14,
  },
  chevron: {
    color: '#7A7A8A',
    fontSize: 20,
  },
});
