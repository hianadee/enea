import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Quote } from '@/types';
import { TYPOGRAPHY, SPACING, PLANET_PALETTES, DEFAULT_PALETTE } from '@/constants/theme';
import { ENNEAGRAM_TYPES } from '@/constants/enneagram';
import { formatShortDate } from '@/utils/dateUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  quote: Quote;
  onPress: () => void;
  index?: number;
}

export const QuoteCard: React.FC<Props> = ({ quote, onPress, index = 0 }) => {
  const { colors } = useTheme();
  const palette = quote.dominantPlanet
    ? PLANET_PALETTES[quote.dominantPlanet]
    : DEFAULT_PALETTE;

  const typeInfo = quote.enneagramType ? ENNEAGRAM_TYPES[quote.enneagramType] : null;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: Math.min(index * 55, 400), // cap delay so long lists don't wait forever
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: Math.min(index * 55, 400),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.75}>
        {/* Planet-colored left accent bar */}
        <View style={[styles.accent, { backgroundColor: palette.primary }]} />

        <View style={styles.content}>
          {/* Date + planet badge */}
          <View style={styles.topRow}>
            <Text style={[styles.date, { color: colors.textMuted }]}>{formatShortDate(quote.date)}</Text>
            {quote.planetaryContext && (
              <View style={[styles.planetBadge, { borderColor: palette.primary + '40' }]}>
                <View style={[styles.planetDot, { backgroundColor: palette.primary }]} />
                <Text style={[styles.planetBadgeText, { color: palette.primary }]} numberOfLines={1}>
                  {quote.planetaryContext}
                </Text>
              </View>
            )}
          </View>

          {/* Quote preview */}
          <Text style={[styles.previewText, { color: colors.text }]} numberOfLines={2}>
            {quote.text}
          </Text>

          {/* Type tag + heart */}
          <View style={styles.bottomRow}>
            {typeInfo && quote.enneagramType ? (
              <Text style={[styles.typeTag, { color: palette.primary + '90' }]}>
                Tipo {quote.enneagramType} · {typeInfo.name}
              </Text>
            ) : (
              <View />
            )}
            {quote.isFavorite && (
              <Text style={[styles.heart, { color: palette.primary }]}>♥</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accent: {
    width: 3,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  date: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  planetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 2,
    paddingHorizontal: 7,
    flexShrink: 1,
  },
  planetDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    flexShrink: 0,
  },
  planetBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  previewText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '300',
    lineHeight: 22,
    fontFamily: 'serif',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeTag: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  heart: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginLeft: SPACING.sm,
  },
});
