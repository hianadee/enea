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
import { TYPOGRAPHY, SPACING, DEFAULT_PALETTE } from '@/constants/theme';
import { QuoteCard } from '@/design-system/components/QuoteCard';
import { MainStackParamList } from '@/navigation/types';

type FilterTab = 'all' | 'saved';

export const JournalScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { enneagramType } = useOnboardingStore();
  const { history, seedHistory } = useQuoteStore();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<FilterTab>('all');

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    seedHistory(enneagramType);
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
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, { borderColor: colors.border }, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterTabText, { color: colors.textMuted }, filter === 'all' && styles.filterTabTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, { borderColor: colors.border }, filter === 'saved' && styles.filterTabActive]}
          onPress={() => setFilter('saved')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterTabText, { color: colors.textMuted }, filter === 'saved' && styles.filterTabTextActive]}>
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
  return (
    <View style={emptyStyles.container}>
      <Text style={[emptyStyles.symbol, { color: colors.textMuted }]}>◌</Text>
      {filter === 'saved' ? (
        <>
          <Text style={[emptyStyles.title, { color: colors.textSecondary }]}>Sin citas guardadas</Text>
          <Text style={[emptyStyles.subtitle, { color: colors.textMuted }]}>Toca el corazón en cualquier cita para guardarla aquí.</Text>
        </>
      ) : (
        <>
          <Text style={[emptyStyles.title, { color: colors.textSecondary }]}>Tu diario está vacío</Text>
          <Text style={[emptyStyles.subtitle, { color: colors.textMuted }]}>Tus citas diarias irán apareciendo aquí a medida que las colecciones.</Text>
        </>
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
    paddingTop: SPACING['3xl'],
  },
  symbol: {
    fontSize: 44,
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
