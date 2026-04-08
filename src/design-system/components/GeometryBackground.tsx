import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  color: string;
  opacity?: number;
}

export const GeometryBackground: React.FC<Props> = ({ color, opacity = 1 }) => (
  <View style={styles.container} pointerEvents="none">
    <View style={[styles.ring, styles.ring1, { borderColor: color, opacity: 0.04 * opacity }]} />
    <View style={[styles.ring, styles.ring2, { borderColor: color, opacity: 0.06 * opacity }]} />
    <View style={[styles.ring, styles.ring3, { borderColor: color, opacity: 0.09 * opacity }]} />
    <View style={[styles.dot, { backgroundColor: color, opacity: 0.3 * opacity }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
  },
  ring1: { width: 420, height: 420 },
  ring2: { width: 280, height: 280 },
  ring3: { width: 160, height: 160 },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
