/**
 * CrashScreen.tsx
 * Pantalla de diagnóstico: muestra el error que mató la app.
 * Solo para desarrollo / builds de diagnóstico.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Props {
  error: Error | string;
  source: 'boundary' | 'promise' | 'native';
}

export const CrashScreen: React.FC<Props> = ({ error, source }) => {
  const message = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'string' ? '' : error.stack ?? '';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>💥 Astro Enea Crash Report</Text>
        <Text style={styles.label}>Source: {source}</Text>
        <Text style={styles.message}>{message}</Text>
        {stack ? <Text style={styles.stack}>{stack}</Text> : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0000',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  scroll: {
    paddingBottom: 40,
  },
  title: {
    color: '#FF6B6B',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    color: '#FFA07A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  stack: {
    color: '#888888',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});
