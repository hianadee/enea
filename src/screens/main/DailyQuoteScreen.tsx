import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useQuoteStore } from '@/store/quoteStore';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, SPACING, PLANET_PALETTES, DEFAULT_PALETTE } from '@/constants/theme';
import { ENNEAGRAM_TYPES } from '@/constants/enneagram';
import { GeometryBackground } from '@/design-system/components/GeometryBackground';
import {
  calculateUniversalDay,
  getDailyNumerologyPhrase,
  calculatePersonalYear,
  NUMEROLOGY_MEANINGS,
} from '@/utils/numerologyUtils';
import { generateDailyQuote } from '@/services/quoteGeneratorService';

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export const DailyQuoteScreen: React.FC = () => {
  const { enneagramType, natalChart, tonePreferences, birthData, numerologyProfile, firstName } = useOnboardingStore();
  const { todayQuote, setTodayQuote, toggleSave } = useQuoteStore();
  const { colors } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);

  const palette = natalChart?.dominantPlanet
    ? PLANET_PALETTES[natalChart.dominantPlanet]
    : DEFAULT_PALETTE;

  const typeInfo = enneagramType ? ENNEAGRAM_TYPES[enneagramType] : null;

  // Numerología — calculada en tiempo real (universalDay varía cada día)
  const universalDay = React.useMemo(() => calculateUniversalDay(), []);
  const personalYear = React.useMemo(
    () => (birthData?.date ? calculatePersonalYear(birthData.date) : null),
    [birthData?.date],
  );
  const dailyNumerologyPhrase = getDailyNumerologyPhrase(universalDay);
  const universalDayMeaning = NUMEROLOGY_MEANINGS[universalDay];
  const lifePathMeaning = numerologyProfile
    ? NUMEROLOGY_MEANINGS[numerologyProfile.lifePath]
    : null;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    // If useQuoteSync already loaded today's quote from Supabase, just animate
    if (todayQuote && todayQuote.date === today) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 14, useNativeDriver: true }),
      ]).start();
      return;
    }

    // Generate a new quote via Edge Function (falls back to placeholder if offline)
    setIsGenerating(true);
    generateDailyQuote({
      firstName:         firstName || 'amigo',
      enneagramType,
      natalChart,
      numerologyProfile,
      tonePreferences,
      birthDate:         birthData?.date,
    })
      .then((quote) => {
        setTodayQuote(quote);
      })
      .finally(() => {
        setIsGenerating(false);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 14, useNativeDriver: true }),
        ]).start();
      });
  }, []);

  const handleSave = () => {
    if (!todayQuote) return;
    toggleSave(todayQuote.id);
    Animated.sequence([
      Animated.spring(heartAnim, { toValue: 1.4, tension: 200, friction: 4, useNativeDriver: true }),
      Animated.spring(heartAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const handleShare = async () => {
    if (!todayQuote) return;
    try {
      await Share.share({
        message: `"${todayQuote.text}"\n\n— ENEA · ${todayQuote.planetaryContext ?? ''}`,
      });
    } catch (_) {}
  };

  const isSaved = todayQuote?.isFavorite ?? false;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GeometryBackground color={palette.primary} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatDate(new Date())}</Text>
          {todayQuote?.planetaryContext && (
            <View style={[styles.planetBadge, { borderColor: palette.primary + '50' }]}>
              <View style={[styles.planetDot, { backgroundColor: palette.primary }]} />
              <Text style={[styles.planetText, { color: palette.primary }]}>
                {todayQuote.planetaryContext}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Quote hero */}
        <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={[styles.openingMark, { color: palette.primary }]}>"</Text>
          <Text style={[styles.quoteText, { color: colors.text }]}>{todayQuote?.text ?? ''}</Text>
          <Text style={[styles.closingMark, { color: palette.primary }]}>"</Text>
        </Animated.View>

        {/* Exclusivity mark */}
        <Animated.View style={[styles.exclusivityRow, { opacity: fadeAnim }]}>
          <View style={[styles.exclusivityLine, { backgroundColor: palette.primary + '30' }]} />
          <Text style={[styles.exclusivityText, { color: palette.primary + '70' }]}>
            Compuesta exclusivamente para ti
          </Text>
          <View style={[styles.exclusivityLine, { backgroundColor: palette.primary + '30' }]} />
        </Animated.View>

        {/* Explanation */}
        <Animated.View style={[styles.explanationContainer, { opacity: fadeAnim }]}>
          <View style={[styles.explanationDivider, { backgroundColor: palette.primary }]} />
          <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{todayQuote?.explanation ?? ''}</Text>
        </Animated.View>

        {/* Type tag */}
        {typeInfo && enneagramType && (
          <Animated.View style={[styles.typeTag, { opacity: fadeAnim }]}>
            <Text style={[styles.typeTagText, { color: palette.primary + 'AA' }]}>
              Tipo {enneagramType} · {typeInfo.name}
              {tonePreferences.lifeFocus ? `  ·  ${tonePreferences.lifeFocus}` : ''}
            </Text>
          </Animated.View>
        )}

        {/* Bloque numerológico */}
        <Animated.View style={[styles.numerologyBlock, { opacity: fadeAnim }]}>
          {/* Línea separadora */}
          <View style={[styles.numerologyDivider, { backgroundColor: palette.primary + '15' }]} />

          {/* Día Universal */}
          <View style={styles.numerologyRow}>
            <View style={styles.numerologyNumberPill}>
              <Text style={[styles.numerologyNumber, { color: palette.primary }]}>
                {universalDay}
              </Text>
              <Text style={[styles.numerologyNumberLabel, { color: palette.primary + '70' }]}>
                DÍA
              </Text>
            </View>
            <Text style={[styles.numerologyPhrase, { color: colors.textMuted }]}>
              {dailyNumerologyPhrase}
            </Text>
          </View>

          {/* Año Personal + Camino de Vida */}
          {(personalYear || lifePathMeaning) && (
            <View style={styles.numerologyMiniRow}>
              {personalYear && (
                <View style={[styles.numerologyMiniPill, { borderColor: palette.primary + '20' }]}>
                  <Text style={[styles.numerologyMiniLabel, { color: colors.textMuted }]}>
                    Año Personal
                  </Text>
                  <Text style={[styles.numerologyMiniNumber, { color: palette.primary + '90' }]}>
                    {personalYear}
                  </Text>
                </View>
              )}
              {lifePathMeaning && numerologyProfile && (
                <View style={[styles.numerologyMiniPill, { borderColor: palette.primary + '20' }]}>
                  <Text style={[styles.numerologyMiniLabel, { color: colors.textMuted }]}>
                    Camino de vida
                  </Text>
                  <Text style={[styles.numerologyMiniNumber, { color: palette.primary + '90' }]}>
                    {numerologyProfile.lifePath} · {lifePathMeaning.titleShort}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Generating overlay */}
      {isGenerating && (
        <View style={styles.generatingOverlay}>
          <ActivityIndicator size="small" color={palette.primary} />
          <Text style={[styles.generatingText, { color: palette.primary + '99' }]}>
            Componiendo tu frase...
          </Text>
        </View>
      )}

      {/* Action bar */}
      <Animated.View style={[styles.actionBar, { opacity: fadeAnim, backgroundColor: colors.background + 'F0', borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleSave} activeOpacity={0.7} accessibilityLabel={isSaved ? 'Quitar de favoritos' : 'Guardar como favorito'} accessibilityRole="button">
          <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
            <Text style={[styles.actionIcon, { color: isSaved ? palette.primary : colors.textSecondary }]}>
              {isSaved ? '♥' : '♡'}
            </Text>
          </Animated.View>
          <Text style={[styles.actionLabel, { color: isSaved ? palette.primary : colors.textMuted }]}>
            {isSaved ? 'Guardado' : 'Guardar'}
          </Text>
        </TouchableOpacity>

        {/* Center ornament — decorative */}
        <View style={styles.centerOrnamentBtn}>
          <View style={styles.centerOrnament}>
            <View style={[styles.ornamentDot, { backgroundColor: palette.primary + '60' }]} />
            <View style={[styles.ornamentLine, { backgroundColor: palette.primary + '30' }]} />
            <View style={[styles.ornamentDot, { backgroundColor: palette.primary + '60' }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7} accessibilityLabel="Compartir frase" accessibilityRole="button">
          <Text style={[styles.actionIcon, { color: colors.textSecondary }]}>↑</Text>
          <Text style={[styles.actionLabel, { color: colors.textMuted }]}>Compartir</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 64,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING['3xl'],
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    letterSpacing: 0.3,
  },
  planetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  planetDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  planetText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: SPACING.xl,
  },
  openingMark: {
    fontSize: 80,
    lineHeight: 60,
    fontWeight: '200',
    marginBottom: SPACING.md,
    marginLeft: -4,
  },
  quoteText: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '300',
    lineHeight: 38,
    letterSpacing: -0.3,
    fontFamily: 'serif',
  },
  closingMark: {
    fontSize: 80,
    lineHeight: 60,
    fontWeight: '200',
    textAlign: 'right',
    marginTop: SPACING.sm,
    marginRight: -4,
  },
  exclusivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  exclusivityLine: {
    flex: 1,
    height: 1,
  },
  exclusivityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 1.4,
    fontWeight: '500',
    textAlign: 'center',
  },
  explanationContainer: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  explanationDivider: {
    width: 24,
    height: 1,
    opacity: 0.6,
  },
  explanationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 21,
    fontWeight: '500',
  },
  typeTag: {
    marginTop: SPACING.lg,
  },
  typeTagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
    minWidth: 56,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 0.3,
  },
  centerOrnamentBtn: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
  },
  centerOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ornamentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  ornamentLine: {
    width: 28,
    height: 1,
  },

  // ─── Generating overlay ───────────────────────────────────────────────────
  generatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  generatingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    letterSpacing: 0.8,
    fontWeight: '500',
  },

  // ─── Bloque numerológico ───────────────────────────────────────────────────
  numerologyBlock: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  numerologyDivider: {
    height: 1,
    marginBottom: SPACING.sm,
  },
  numerologyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  numerologyNumberPill: {
    alignItems: 'center',
    minWidth: 36,
  },
  numerologyNumber: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '200',
    lineHeight: 28,
    fontFamily: 'serif',
  },
  numerologyNumberLabel: {
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  numerologyPhrase: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    fontWeight: '500',
    marginTop: 4,
  },
  numerologyMiniRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: 4,
  },
  numerologyMiniPill: {
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  numerologyMiniLabel: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  numerologyMiniNumber: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
