import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing } from '@/design-system/tokens';
import { Button, Card, Input } from '@/design-system/components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useQuoteStore } from '@/store/quoteStore';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { EmailGateSheet } from '@/design-system/components/EmailGateSheet';

const EMAIL_GATE_KEY = 'enea-email-gate-shown';
import { TYPOGRAPHY, SPACING, PLANET_PALETTES, DEFAULT_PALETTE } from '@/constants/theme';
import { ENNEAGRAM_TYPES } from '@/constants/enneagram';
import { GeometryBackground } from '@/design-system/components/GeometryBackground';
import { formatLongDate } from '@/utils/dateUtils';
import { MainStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'QuoteDetail'>;
  route: RouteProp<MainStackParamList, 'QuoteDetail'>;
};

export const QuoteDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { quoteId } = route.params;
  const { tonePreferences } = useOnboardingStore();
  const { history, toggleSave } = useQuoteStore();
  const { colors } = useTheme();
  const { isAnonymous } = useAuthContext();
  const [gateVisible, setGateVisible] = useState(false);

  const quote = history.find((q) => q.id === quoteId);

  const palette = quote?.dominantPlanet
    ? PLANET_PALETTES[quote.dominantPlanet]
    : DEFAULT_PALETTE;

  const typeInfo = quote?.enneagramType ? ENNEAGRAM_TYPES[quote.enneagramType] : null;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 16, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSave = useCallback(async () => {
    if (!quote) return;
    const wasFavorite = quote.isFavorite;
    toggleSave(quote.id);
    Animated.sequence([
      Animated.spring(heartAnim, { toValue: 1.5, tension: 200, friction: 4, useNativeDriver: true }),
      Animated.spring(heartAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();

    // Mostrar gate la primera vez que un usuario anónimo guarda una frase
    if (isAnonymous && !wasFavorite) {
      try {
        const shown = await AsyncStorage.getItem(EMAIL_GATE_KEY);
        if (!shown) setGateVisible(true);
      } catch {}
    }
  }, [quote, isAnonymous, toggleSave]);

  const handleGateDismiss = useCallback(async () => {
    setGateVisible(false);
    try { await AsyncStorage.setItem(EMAIL_GATE_KEY, 'true'); } catch {}
  }, []);

  const handleShare = async () => {
    if (!quote) return;
    try {
      await Share.share({
        message: `"${quote.text}"\n\n— ENEA · ${quote.planetaryContext ?? ''}`,
      });
    } catch (_) {}
  };

  if (!quote) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver atrás"
          accessibilityRole="button"
        >
          <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>×</Text>
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.textMuted }]}>Cita no encontrada.</Text>
        </View>
      </View>
    );
  }

  const isSaved = quote.isFavorite;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GeometryBackground color={palette.primary} opacity={0.8} />

      {/* Close button */}
      <Animated.View style={[styles.topBar, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Cerrar detalle"
          accessibilityRole="button"
        >
          <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>×</Text>
        </TouchableOpacity>
        {quote.planetaryContext && (
          <View style={[styles.planetBadge, { borderColor: palette.primary + '50' }]}>
            <View style={[styles.planetDot, { backgroundColor: palette.primary }]} />
            <Text style={[styles.planetText, { color: palette.primary }]}>
              {quote.planetaryContext}
            </Text>
          </View>
        )}
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Date */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatLongDate(quote.date)}</Text>
        </Animated.View>

        {/* Quote hero */}
        <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={[styles.openingMark, { color: palette.primary }]}>"</Text>
          <Text style={[styles.quoteText, { color: colors.text }]}>{quote.text}</Text>
          <Text style={[styles.closingMark, { color: palette.primary }]}>"</Text>
        </Animated.View>

        {/* Exclusivity mark */}
        <Animated.View style={[styles.exclusivityRow, { opacity: fadeAnim }]}>
          <View style={[styles.exclusivityLine, { backgroundColor: palette.primary + '30' }]} />
          <Text style={[styles.exclusivityText, { color: palette.primary + '70' }]}>
            compuesta únicamente para ti
          </Text>
          <View style={[styles.exclusivityLine, { backgroundColor: palette.primary + '30' }]} />
        </Animated.View>

        {/* Explanation */}
        <Animated.View style={[styles.explanationContainer, { opacity: fadeAnim }]}>
          <View style={[styles.explanationDivider, { backgroundColor: palette.primary }]} />
          <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{quote.explanation}</Text>
        </Animated.View>

        {/* Type tag */}
        {typeInfo && quote.enneagramType && (
          <Animated.View style={[styles.typeTag, { opacity: fadeAnim }]}>
            <Text style={[styles.typeTagText, { color: palette.primary + 'AA' }]}>
              Tipo {quote.enneagramType} · {typeInfo.name}
              {tonePreferences.lifeFocus ? `  ·  ${tonePreferences.lifeFocus}` : ''}
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Email gate */}
      <EmailGateSheet visible={gateVisible} onDismiss={handleGateDismiss} />

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

        <View style={styles.centerOrnament}>
          <View style={[styles.ornamentDot, { backgroundColor: palette.primary + '60' }]} />
          <View style={[styles.ornamentLine, { backgroundColor: palette.primary + '20' }]} />
          <View style={[styles.ornamentDot, { backgroundColor: palette.primary + '60' }]} />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.sm,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 20,
    lineHeight: 22,
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 110,
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    letterSpacing: 0.3,
    marginBottom: SPACING['2xl'],
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
    lineHeight: 22,
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
});
