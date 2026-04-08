import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
} from 'react-native';
import { colors, typography, spacing } from '@/design-system/tokens';
import { Button, Card, Input } from '@/design-system/components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuoteStore } from '@/store/quoteStore';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, SPACING } from '@/constants/theme';
import { QuoteCard } from '@/design-system/components/QuoteCard';
import { MainStackParamList } from '@/navigation/types';

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { history } = useQuoteStore();
  const { colors } = useTheme();

  const savedQuotes = history.filter((q) => q.isFavorite);

  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Favoritos</Text>
          <Text style={[styles.headerCount, { color: colors.textMuted }]}>
            {savedQuotes.length} {savedQuotes.length === 1 ? 'cita guardada' : 'citas guardadas'}
          </Text>
        </View>
      </Animated.View>

      {/* List */}
      <FlatList
        data={savedQuotes}
        keyExtractor={(q) => q.id}
        renderItem={({ item, index }) => (
          <QuoteCard
            quote={item}
            index={index}
            onPress={() => navigation.navigate('QuoteDetail', { quoteId: item.id })}
          />
        )}
        contentContainerStyle={[
          styles.list,
          savedQuotes.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={emptyStyles.container}>
      <Animated.Text style={[emptyStyles.symbol, { opacity: pulseAnim }]}>
        ♡
      </Animated.Text>
      <Text style={[emptyStyles.title, { color: colors.textSecondary }]}>Nada guardado aún</Text>
      <Text style={[emptyStyles.subtitle, { color: colors.textMuted }]}>
        Toca el corazón en tu cita diaria{'\n'}para guardarla aquí.
      </Text>

      {/* Decorative ornament */}
      <View style={emptyStyles.ornament}>
        <View style={[emptyStyles.ornamentDot, { backgroundColor: '#FC818140' }]} />
        <View style={[emptyStyles.ornamentLine, { backgroundColor: '#FC818120' }]} />
        <View style={[emptyStyles.ornamentDot, { backgroundColor: '#FC818140' }]} />
      </View>
    </View>
  );
};

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['2xl'],
  },
  symbol: {
    fontSize: 56,
    color: '#FC8181',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '300',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ornamentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  ornamentLine: {
    width: 40,
    height: 1,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '300',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    gap: SPACING.sm,
  },
  listEmpty: {
    flex: 1,
  },
});
