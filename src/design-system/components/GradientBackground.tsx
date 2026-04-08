import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  colorScheme?: 'dark' | 'light';
}

// Simple solid background — replace with expo-linear-gradient if desired
export const GradientBackground: React.FC<Props> = ({
  children,
  style,
  colorScheme = 'dark',
}) => {
  const bg = colorScheme === 'dark' ? COLORS.dark.background : COLORS.light.background;

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
