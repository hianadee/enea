/**
 * DailyQuoteBanner.tsx
 * Banner in-app que invita al usuario a descubrir su frase del día.
 *
 * - Se desliza desde arriba con spring animation
 * - Se auto-descarta a los AUTO_DISMISS_MS milisegundos
 * - Tapping navega a la pestaña Hoy
 * - Respeta el safe area top (notch / Dynamic Island)
 * - Posicionado de forma absoluta sobre toda la UI
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Config ───────────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 6_000;
const ACCENT          = '#FC8181';
const BANNER_HEIGHT   = 56; // altura sin safe area

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
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();

  // Altura total incluyendo safe area top
  const totalHeight = BANNER_HEIGHT + insets.top;

  // Animación: parte oculta arriba, entra con spring
  const translateY = useRef(new Animated.Value(-totalHeight)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Enter / Exit ──────────────────────────────────────────────────────────

  const enter = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue:         0,
        tension:         80,
        friction:        12,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue:         1,
        duration:        200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    autoDismissTimer.current = setTimeout(exit, AUTO_DISMISS_MS);
  }, [totalHeight]);

  const exit = useCallback(() => {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue:         -totalHeight,
        duration:        280,
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
  }, [totalHeight, onDismiss]);

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (visible) {
      // Resetear posición antes de entrar (por si se mostró antes)
      translateY.setValue(-totalHeight);
      opacity.setValue(0);
      enter();
    } else {
      exit();
    }
    return () => {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };
  }, [visible]);

  // No renderizar nada si está oculto y la animación ya terminó
  if (!visible) return null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop:       insets.top,
          height:           totalHeight,
          transform:        [{ translateY }],
          opacity,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      {/* Borde inferior acento */}
      <View style={[styles.accentLine, { backgroundColor: ACCENT + '60' }]} />

      <TouchableOpacity
        style={styles.inner}
        onPress={() => { exit(); onPress(); }}
        activeOpacity={0.85}
        accessibilityLabel="Ver tu frase de hoy"
        accessibilityRole="button"
        accessibilityHint="Abre la pantalla con tu frase personalizada de hoy"
      >
        {/* Icono */}
        <Text style={styles.icon}>✦</Text>

        {/* Texto */}
        <Text
          style={[styles.text, { color: colors.text }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          ¿Estás preparado/a para saber tu frase de hoy?
        </Text>

        {/* Botón cerrar */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => exit()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Cerrar aviso"
          accessibilityRole="button"
        >
          <Text style={[styles.closeIcon, { color: colors.textMuted }]}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position:  'absolute',
    top:       0,
    left:      0,
    right:     0,
    zIndex:    999,
    elevation: 10,           // Android shadow
    // Sombra iOS
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius:  6,
      },
    }),
  },
  accentLine: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   1,
  },
  inner: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 16,
    gap:            10,
  },
  icon: {
    fontSize: 14,
    color:    ACCENT,
    flexShrink: 0,
  },
  text: {
    flex:       1,
    fontSize:   13,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  closeBtn: {
    flexShrink: 0,
    padding:    4,
  },
  closeIcon: {
    fontSize: 12,
    fontWeight: '600',
  },
});
