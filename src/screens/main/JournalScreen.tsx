import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { colors, typography, spacing } from '@/design-system/tokens';
import { Button, Card, Input } from '@/design-system/components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useQuoteStore } from '@/store/quoteStore';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, SPACING, FONT_FAMILY, DEFAULT_PALETTE } from '@/constants/theme';
import { QuoteCard } from '@/design-system/components/QuoteCard';
import { MainStackParamList } from '@/navigation/types';

type FilterTab = 'all' | 'saved';

export const JournalScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { enneagramType } = useOnboardingStore();
  const { history } = useQuoteStore();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<FilterTab>('all');

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredQuotes = filter === 'saved' ? history.filter((q) => q.isFavorite) : history;
  const savedCount = history.filter((q) => q.isFavorite).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Diario</Text>
          <Text style={[styles.headerCount, { color: colors.textMuted }]}>
            {filteredQuotes.length} {filteredQuotes.length === 1 ? 'entrada' : 'entradas'}
          </Text>
        </View>
      </Animated.View>

      {/* Filter tabs */}
      <View style={styles.filterRow} accessibilityRole="tablist">
        <TouchableOpacity
          style={[styles.filterTab, { borderColor: colors.border }, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityLabel="Todas las citas"
          accessibilityState={{ selected: filter === 'all' }}
        >
          <Text style={[styles.filterTabText, { color: colors.textMuted }, filter === 'all' && styles.filterTabTextActive]} accessibilityElementsHidden={true}>
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, { borderColor: colors.border }, filter === 'saved' && styles.filterTabActive]}
          onPress={() => setFilter('saved')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityLabel={savedCount > 0 ? `Guardadas, ${savedCount}` : 'Guardadas'}
          accessibilityState={{ selected: filter === 'saved' }}
        >
          <Text style={[styles.filterTabText, { color: colors.textMuted }, filter === 'saved' && styles.filterTabTextActive]} accessibilityElementsHidden={true}>
            {savedCount > 0 ? `♥  Guardadas  ${savedCount}` : '♡  Guardadas'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredQuotes}
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
          filteredQuotes.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={<EmptyState filter={filter} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ filter: FilterTab }> = ({ filter }) => {
  const { colors } = useTheme();
  const isSaved = filter === 'saved';

  return (
    <View style={emptyStyles.container}>
      {/* Glifo circular minimal */}
      <View style={[
        emptyStyles.glyph,
        { borderColor: isSaved ? '#FC818140' : colors.border },
      ]}>
        <Text style={[
          emptyStyles.glyphChar,
          { color: isSaved ? '#FC8181' : colors.textMuted },
        ]}>
          {isSaved ? '♡' : '∗'}
        </Text>
      </View>

      {/* Headline serif editorial */}
      <Text style={[emptyStyles.headline, { color: colors.text }]}>
        {isSaved
          ? 'Aún no has guardado\nninguna frase.'
          : 'Tu diario empieza\ncon la frase de hoy.'}
      </Text>

      {/* Body */}
      <Text style={[emptyStyles.body, { color: colors.textMuted }]}>
        {isSaved
          ? 'Cuando una frase te resuene, tócala con el corazón. Aquí encontrarás las que más te importan.'
          : 'Cada día que abras Enea, la frase quedará guardada aquí. Con el tiempo verás tu historia.'}
      </Text>

      {/* Hint solo en saved */}
      {isSaved && (
        <View style={emptyStyles.hintRow}>
          <Text style={emptyStyles.hintHeart}>♡</Text>
          <Text style={[emptyStyles.hint, { color: colors.textMuted }]}>
            Toca el corazón en cualquier frase
          </Text>
        </View>
      )}
    </View>
  );
};

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['3xl'],
    gap: 22,
  },
  glyph: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphChar: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.serif,
    fontStyle: 'italic',
  },
  headline: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 26,
    fontWeight: '300',
    lineHeight: 34,
    letterSpacing: -0.3,
    textAlign: 'center',
    maxWidth: 260,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 260,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  hintHeart: {
    color: '#FC8181',
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    letterSpacing: 0.4,
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: 100,
    borderWidth: 1,
    minHeight: 44,          // WCAG 2.5.5 — touch target mínimo 44×44pt
    justifyContent: 'center',
  },
  filterTabActive: {
    borderColor: '#FC818160',
    backgroundColor: '#FC818112',
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FC8181',
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
