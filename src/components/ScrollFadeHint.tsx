/**
 * ScrollFadeHint
 * Overlay absoluto en la parte inferior de un ScrollView que indica
 * visualmente que hay más contenido por debajo.
 * Desaparece automáticamente cuando el usuario llega al final.
 *
 * Uso:
 *   const { showFade, onScroll, onContentSizeChange, onLayout } = useScrollFade();
 *   ...
 *   <View style={{ flex: 1 }}>
 *     <ScrollView onScroll={onScroll} onContentSizeChange={onContentSizeChange} onLayout={onLayout} scrollEventThrottle={16}>
 *       {content}
 *     </ScrollView>
 *     <ScrollFadeHint visible={showFade} bgColor="#0A0A0F" />
 *   </View>
 */

import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Hook ──────────────────────────────────────────────────────────────────────

interface ScrollFadeState {
  showFade:            boolean;
  onScroll:            (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onContentSizeChange: (w: number, h: number) => void;
  onLayout:            (e: LayoutChangeEvent) => void;
}

export function useScrollFade(threshold = 24): ScrollFadeState {
  const [contentH, setContentH]   = useState(0);
  const [layoutH,  setLayoutH]    = useState(0);
  const [scrollY,  setScrollY]    = useState(0);

  const hasOverflow = contentH > layoutH + threshold;
  const isAtBottom  = scrollY + layoutH >= contentH - threshold;
  const showFade    = hasOverflow && !isAtBottom;

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  }, []);

  const onContentSizeChange = useCallback((_: number, h: number) => {
    setContentH(h);
  }, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setLayoutH(e.nativeEvent.layout.height);
  }, []);

  return { showFade, onScroll, onContentSizeChange, onLayout };
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface ScrollFadeHintProps {
  visible:   boolean;
  bgColor?:  string;
  height?:   number;
  /** Desplazamiento desde abajo — útil cuando hay una barra flotante encima */
  bottom?:   number;
}

export const ScrollFadeHint: React.FC<ScrollFadeHintProps> = ({
  visible,
  bgColor = '#0A0A0F',
  height  = 72,
  bottom  = 0,
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.wrapper, { height, bottom }]} pointerEvents="none">
      <LinearGradient
        colors={['transparent', bgColor]}
        style={StyleSheet.absoluteFill}
      />
      {/* Chevron indicador */}
      <View style={styles.chevronWrap}>
        <View style={[styles.chevronLeft,  { borderColor: bgColor === '#0A0A0F' ? '#3A3A4A' : '#555570' }]} />
        <View style={[styles.chevronRight, { borderColor: bgColor === '#0A0A0F' ? '#3A3A4A' : '#555570' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  chevronWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 10,
    gap: 0,
  },
  chevronLeft: {
    width: 10,
    height: 10,
    borderBottomWidth: 1.5,
    borderRightWidth: 0,
    borderLeftWidth: 1.5,
    borderTopWidth: 0,
    borderBottomColor: '#3A3A4A',
    borderLeftColor: '#3A3A4A',
    transform: [{ rotate: '-45deg' }, { translateX: 3 }],
  },
  chevronRight: {
    width: 10,
    height: 10,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomColor: '#3A3A4A',
    borderRightColor: '#3A3A4A',
    transform: [{ rotate: '45deg' }, { translateX: -3 }],
  },
});
