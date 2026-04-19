/**
 * DailyQuoteBanner.tsx
 * Banner in-app con aspecto de notificación nativa del sistema.
 *
 * Diseño: icono de la app + "Enea" como título + frase del día como subtítulo.
 * Estilo inspirado en las notificaciones de iOS y Android (Co-Star, Headspace).
 *
 * - Se desliza desde arriba con spring animation
 * - Se auto-descarta a los AUTO_DISMISS_MS milisegundos
 * - Tapping navega a la pestaña Hoy
 * - Respeta el safe area top (notch / Dynamic Island)
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Config ───────────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 6_000;

// ─── Props ────────────────────────────────────────────────────────────────────

interface DailyQuoteBannerProps {
  visible:   boolean;
  onPress:   () => void;
  onDismiss: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DailyQuoteBanner: React.FC<DailyQuoteBannerProps> = ({
  visible,
  onPress,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Enter / Exit ──────────────────────────────────────────────────────────

  const enter = useCallback(() => {
    translateY.setValue(-200);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue:         0,
        tension:         65,
        friction:        11,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue:         1,
        duration:        250,
        useNativeDriver: true,
      }),
    ]).start();

    autoDismissTimer.current = setTimeout(exit, AUTO_DISMISS_MS);
  }, []);

  const exit = useCallback(() => {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue:         -200,
        duration:        300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue:         0,
        duration:        200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onDismiss();
    });
  }, [onDismiss]);

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (visible) enter();
    else exit();
    return () => {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };
  }, [visible]);

  if (!visible) return null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          transform:  [{ translateY }],
          opacity,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => { exit(); onPress(); }}
        activeOpacity={0.9}
        accessibilityLabel="Astro Enea: Tu frase diaria está lista. Toca para verla."
        accessibilityRole="button"
      >
        {/* App icon */}
        <Image
          source={require('../../assets/ios-light.png')}
          style={styles.appIcon}
        />

        {/* Text content */}
        <View style={styles.textColumn}>
          <View style={styles.headerRow}>
            <Text style={styles.appName}>Astro Enea</Text>
            <Text style={styles.timestamp}>ahora</Text>
          </View>
          <Text style={styles.body} numberOfLines={2}>
            Tu frase diaria está lista.
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    zIndex:   999,
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    paddingVertical:   12,
    paddingHorizontal: 14,
    gap: 12,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius:  12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  appIcon: {
    width:        36,
    height:       36,
    borderRadius: 8,
    flexShrink:   0,
  },
  textColumn: {
    flex: 1,
    gap:  2,
  },
  headerRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  appName: {
    color:      '#000000',
    fontSize:   14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  timestamp: {
    color:    '#6B6B6B',
    fontSize: 12,
  },
  body: {
    color:      '#1C1C1E',
    fontSize:   14,
    lineHeight: 19,
  },
});
