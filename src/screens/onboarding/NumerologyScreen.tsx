/**
 * NumerologyScreen.tsx
 * Pantalla de revelación del perfil numerológico durante el onboarding.
 * Se ubica después de NatalChartPreview, antes de EnneagramIntro.
 *
 * Muestra:
 *   - Número de Camino de Vida (animado)
 *   - Arquetipo y frase poética del número
 *   - Año Personal y Día Universal como contexto
 *   - Keywords del número
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { colors, typography, spacing } from '@/design-system/tokens';
import { Button, Card, Input } from '@/design-system/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/types';
import { useOnboardingStore } from '@/store/onboardingStore';
import {
  calculateNumerologyProfile,
  NUMEROLOGY_MEANINGS,
  getDailyNumerologyPhrase,
} from '@/utils/numerologyUtils';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Numerology'>;
};

const TOTAL_STEPS = 10; // Total de pasos visibles en el onboarding

export const NumerologyScreen: React.FC<Props> = ({ navigation }) => {
  const { birthData, setNumerologyProfile, setStep } = useOnboardingStore();

  // Calcular perfil numerológico a partir de la fecha de nacimiento
  const profile = React.useMemo(() => {
    if (!birthData.date) return null;
    return calculateNumerologyProfile(birthData.date);
  }, [birthData.date]);

  const meaning = profile ? NUMEROLOGY_MEANINGS[profile.lifePath] : null;
  const dailyPhrase = profile ? getDailyNumerologyPhrase(profile.universalDay) : '';

  // Animaciones
  const fadeAnim        = useRef(new Animated.Value(0)).current;
  const scaleAnim       = useRef(new Animated.Value(0.6)).current;
  const slideUpAnim     = useRef(new Animated.Value(30)).current;
  const detailsFadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim        = useRef(new Animated.Value(0)).current;

  // Contador animado del número
  const [displayNumber, setDisplayNumber] = useState(0);
  const targetNumber = profile?.lifePath ?? 0;

  useEffect(() => {
    if (!profile) return;

    // Guardar perfil en el store
    setNumerologyProfile(profile);

    // Secuencia de animación
    Animated.sequence([
      // 1. Fade in del fondo y encabezado
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // 2. El número escala hacia arriba con bounce
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 70,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // 3. Detalles suben y aparecen
      Animated.parallel([
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(detailsFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Contador numérico animado (0 → número final)
    let current = 0;
    const step = Math.ceil(targetNumber / 12);
    const interval = setInterval(() => {
      current += step;
      if (current >= targetNumber) {
        setDisplayNumber(targetNumber);
        clearInterval(interval);
      } else {
        setDisplayNumber(current);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [profile]);

  const handleContinue = () => {
    setStep('enneagram_intro');
    navigation.navigate('EnneagramIntro');
  };

  if (!profile || !meaning) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo calcular tu perfil numerológico.</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={handleContinue}>
            <Text style={styles.ctaBtnText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const accentColor = meaning.color;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header con step counter */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Volver"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepCounter}>6 de {TOTAL_STEPS}</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Título introductorio */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.preTitle}>TU NÚMERO</Text>
          <Text style={styles.title}>Tu camino tiene{'\n'}su propio idioma.</Text>
        </Animated.View>

        {/* Número principal — elemento central */}
        <Animated.View
          style={[
            styles.numberContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: scaleAnim,
            },
          ]}
        >
          {/* Anillo de brillo */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                borderColor: accentColor,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.25],
                }),
              },
            ]}
          />
          {/* Número */}
          <Text style={[styles.bigNumber, { color: accentColor }]}>
            {displayNumber}
          </Text>
          {/* Línea decorativa */}
          <View style={[styles.numberUnderline, { backgroundColor: accentColor + '40' }]} />
        </Animated.View>

        {/* Arquetipo y frase */}
        <Animated.View
          style={[
            styles.meaningContainer,
            {
              opacity: detailsFadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          {/* Badge del arquetipo */}
          <View style={[styles.archetypeBadge, { borderColor: accentColor + '50' }]}>
            <View style={[styles.archetypeDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.archetypeTitle, { color: accentColor }]}>
              {meaning.title}
            </Text>
          </View>

          {/* Frase poética */}
          <Text style={styles.meaningPhrase}>"{meaning.phrase}"</Text>

          {/* Descripción */}
          <Text style={styles.meaningDescription}>{meaning.description}</Text>

          {/* Keywords */}
          <View style={styles.keywordsRow}>
            {meaning.keywords.map((kw, i) => (
              <View
                key={i}
                style={[styles.keyword, { borderColor: accentColor + '30' }]}
              >
                <Text style={[styles.keywordText, { color: accentColor + 'BB' }]}>
                  {kw}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Separador */}
        <Animated.View
          style={[
            styles.dividerRow,
            { opacity: detailsFadeAnim },
          ]}
        >
          <View style={[styles.dividerLine, { backgroundColor: accentColor + '20' }]} />
          <Text style={[styles.dividerText, { color: '#FC8181' }]}>
            CONTEXTO DEL DÍA
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: accentColor + '20' }]} />
        </Animated.View>

        {/* Contexto del día */}
        <Animated.View
          style={[
            styles.contextContainer,
            { opacity: detailsFadeAnim },
          ]}
        >
          {/* Día Universal */}
          <View style={styles.contextRow}>
            <View style={styles.contextLabelContainer}>
              <Text style={styles.contextLabel}>DÍA UNIVERSAL</Text>
              <Text style={[styles.contextNumber, { color: accentColor }]}>
                {profile.universalDay}
              </Text>
            </View>
            <Text style={styles.contextDescription}>{dailyPhrase}</Text>
          </View>

          {/* Año Personal */}
          <View style={[styles.contextRow, styles.contextRowLast]}>
            <View style={styles.contextLabelContainer}>
              <Text style={styles.contextLabel}>AÑO PERSONAL</Text>
              <Text style={[styles.contextNumber, { color: accentColor }]}>
                {profile.personalYear}
              </Text>
            </View>
            <Text style={styles.contextDescription}>
              {NUMEROLOGY_MEANINGS[profile.personalYear]?.titleShort ?? ''} ·{' '}
              {NUMEROLOGY_MEANINGS[profile.personalYear]?.keywords[0] ?? ''}
            </Text>
          </View>
        </Animated.View>

        {/* Nota sobre el aspecto sombra */}
        <Animated.View
          style={[
            styles.shadowContainer,
            { opacity: detailsFadeAnim },
          ]}
        >
          <Text style={styles.shadowLabel}>✦ Desafío del {profile.lifePath}</Text>
          <Text style={styles.shadowText}>{meaning.shadow}</Text>
        </Animated.View>
      </ScrollView>

      {/* Footer CTA */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
          accessibilityLabel="Continuar al siguiente paso"
          accessibilityRole="button"
        >
          <Text style={styles.ctaBtnText}>Continuar</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

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

  // Scroll
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 32,
  },

  // Título
  preTitle: {
    fontSize: 14,
    color: colors.fg.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 30,
    color: colors.fg.primary,
    fontWeight: '300',
    lineHeight: 40,
    letterSpacing: -0.3,
    marginBottom: 40,
  },

  // Número grande
  numberContainer: {
    alignItems: 'center',
    marginBottom: 44,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    top: '50%',
    marginTop: -80,
    alignSelf: 'center',
  },
  bigNumber: {
    fontSize: 120,
    fontWeight: '200',
    lineHeight: 130,
    letterSpacing: -4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  numberUnderline: {
    width: 60,
    height: 1,
    marginTop: 8,
  },

  // Significado
  meaningContainer: {
    marginBottom: 32,
    gap: 16,
  },
  archetypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  archetypeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  archetypeTitle: {
    fontSize: 14,
    letterSpacing: 0.5,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  meaningPhrase: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    color: colors.fg.primary,
    lineHeight: 32,
    fontWeight: '300',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  meaningDescription: {
    fontSize: 14,
    color: '#A8A8B8',
    lineHeight: 22,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keyword: {
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  keywordText: {
    fontSize: 14,
    letterSpacing: 0.4,
    textTransform: 'lowercase',
  },

  // Separador
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Contexto del día
  contextContainer: {
    backgroundColor: '#0A0A0A',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    gap: 0,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1A1A1A',
    marginBottom: 16,
  },
  contextRowLast: {
    paddingBottom: 0,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  contextLabelContainer: {
    alignItems: 'center',
    minWidth: 48,
  },
  contextLabel: {
    fontSize: 14,
    color: colors.fg.secondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  contextNumber: {
    fontSize: 28,
    fontWeight: '200',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 32,
  },
  contextDescription: {
    flex: 1,
    fontSize: 14,
    color: '#A8A8B8',
    lineHeight: 21,
    marginTop: 8,
    fontWeight: '500',
  },

  // Sombra
  shadowContainer: {
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingLeft: 16,
    marginBottom: 24,
  },
  shadowLabel: {
    fontSize: 14,
    color: colors.fg.secondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  shadowText: {
    fontSize: 14,
    color: colors.fg.secondary,
    lineHeight: 21,
    fontWeight: '500',
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
  },
  ctaBtn: {
    backgroundColor: colors.fg.primary,
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    color: colors.bg.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  errorText: {
    color: '#8A8A9A',
    fontSize: 14,
    textAlign: 'center',
  },
});
