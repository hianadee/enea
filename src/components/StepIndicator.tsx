import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

interface Props {
  total: number;
  current: number;
  accentColor?: string;
}

export const StepIndicator: React.FC<Props> = ({
  total,
  current,
  accentColor = '#C4B5FD',
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current
              ? [styles.activeDot, { backgroundColor: accentColor }]
              : i < current
              ? [styles.completedDot, { backgroundColor: accentColor, opacity: 0.4 }]
              : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
  },
  completedDot: {
    width: 6,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: COLORS.dark.border,
  },
});
