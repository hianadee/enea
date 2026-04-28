import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, SPACING, DEFAULT_PALETTE } from '@/constants/theme';

const ACCENT = '#FC8181';

interface TabConfig {
  name: string;
  label: string;
  icon: (active: boolean, hasBadge?: boolean) => string;
}

const TABS: TabConfig[] = [
  { name: 'Today',    label: 'Hoy',    icon: () => '◉' },
  { name: 'Journal',  label: 'Diario', icon: () => '◈' },
  { name: 'Settings', label: 'Tú',     icon: () => '◎' },
];

interface TabItemProps {
  config: TabConfig;
  active: boolean;
  onPress: () => void;
  hasBadge?: boolean;
  inactiveColor: string;
}

const TabItem: React.FC<TabItemProps> = ({ config, active, onPress, hasBadge, inactiveColor }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: active ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [active]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.82, duration: 70, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const iconColor  = colorAnim.interpolate({ inputRange: [0, 1], outputRange: [inactiveColor, ACCENT] });
  const labelColor = colorAnim.interpolate({ inputRange: [0, 1], outputRange: [inactiveColor, ACCENT] });

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={handlePress}
      activeOpacity={1}
      accessibilityRole="tab"
      accessibilityLabel={config.label}
      accessibilityState={{ selected: active }}
    >
      <Animated.View style={[styles.tabInner, { transform: [{ scale: scaleAnim }] }]}>
        <Animated.Text
          style={[styles.tabIcon, { color: iconColor }]}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          {config.icon(active, hasBadge)}
        </Animated.Text>
        <Animated.Text
          style={[styles.tabLabel, { color: labelColor }]}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          {config.label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const TabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const active = state.index === routeIndex;
          return (
            <TabItem
              key={tab.name}
              config={tab}
              active={active}
              inactiveColor={colors.textMuted}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: state.routes[routeIndex]?.key,
                  canPreventDefault: true,
                });
                if (!active && !event.defaultPrevented) {
                  navigation.navigate(tab.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  separator: { height: 1 },
  tabs: { flexDirection: 'row', paddingTop: 6 },
  tabItem:  { flex: 1, alignItems: 'center', minHeight: 44 },
  tabInner: { alignItems: 'center', gap: 2, paddingHorizontal: SPACING.xs, paddingVertical: 2 },
  tabIcon:  { fontSize: 16 },
  tabLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 0.4 },
});
