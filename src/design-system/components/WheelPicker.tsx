/**
 * WheelPicker — infinite-looping scroll picker backed by FlatList.
 *
 * Geometry (key insight):
 *   data = [spacer, spacer, item_vi=0, item_vi=1, … item_vi=REPEAT*N-1, spacer, spacer]
 *   getItemLayout: every data-index k → offset = k * ITEM_HEIGHT
 *   To centre virtual item vi: scrollOffset = vi * ITEM_HEIGHT
 *                               → initialScrollIndex = vi   (topmost row)
 *   Initial centre target: vi = CENTER + defaultIndex
 *     where CENTER = floor(REPEAT/2) * N
 */
import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ListRenderItemInfo,
} from 'react-native';

export const ITEM_HEIGHT = 64;
const VISIBLE = 5;
export const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE;
const REPEAT = 100; // repeat items this many times for "infinite" feel
const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

type Row = { id: string; value: string; vi: number; spacer: boolean };

export interface WheelPickerProps {
  items: string[];
  defaultIndex?: number;
  onChange: (index: number) => void;
  isPrimary?: boolean;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  items,
  defaultIndex = 0,
  onChange,
  isPrimary = false,
}) => {
  const N = items.length;
  const CENTER = Math.floor(REPEAT / 2) * N; // virtual-index offset near the middle

  // Build the full data array once; only rebuilds when items/N changes
  const data = useMemo<Row[]>(() => [
    { id: 's1', value: '', vi: -2, spacer: true },
    { id: 's2', value: '', vi: -1, spacer: true },
    ...Array.from({ length: REPEAT * N }, (_, i) => ({
      id: `r${i}`,
      value: items[i % N],
      vi: i,
      spacer: false,
    })),
    { id: 'e1', value: '', vi: REPEAT * N,     spacer: true },
    { id: 'e2', value: '', vi: REPEAT * N + 1, spacer: true },
  ], [items, N]);

  // selVi drives the opacity/size of every visible row
  const [selVi, setSelVi] = useState(CENTER + defaultIndex);
  const lastIdx = useRef(defaultIndex);
  const listRef = useRef<FlatList<Row>>(null);

  // FlatList needs this to support initialScrollIndex
  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: index * ITEM_HEIGHT,
    index,
  }), []);

  // initialScrollIndex is the data-index of the TOPMOST visible row.
  // With our 2-spacer prefix, topmost = vi − 0 in data-index terms equals vi itself
  // (because spacers at 0,1 push real items to start at data-index 2;
  //  initialScrollIndex = vi makes data[vi] topmost → data[vi+2] centred).
  const initialScrollIndex = CENTER + defaultIndex;

  const applySnap = useCallback((y: number, forceScroll: boolean) => {
    const vi  = Math.max(0, Math.min(REPEAT * N - 1, Math.round(y / ITEM_HEIGHT)));
    const idx = ((vi % N) + N) % N;
    setSelVi(vi);
    if (forceScroll) {
      listRef.current?.scrollToOffset({ offset: vi * ITEM_HEIGHT, animated: true });
    }
    if (idx !== lastIdx.current) {
      lastIdx.current = idx;
      onChange(idx);
    }
  }, [N, onChange]);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) =>
      applySnap(e.nativeEvent.contentOffset.y, false),
    [applySnap],
  );

  const onDragEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) =>
      applySnap(e.nativeEvent.contentOffset.y, true),
    [applySnap],
  );

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Row>) => {
    if (item.spacer) return <View style={styles.spacer} />;

    const dist  = Math.abs(item.vi - selVi);
    const d     = Math.min(dist, 4);
    const sizes   = isPrimary ? [52, 28, 18, 12, 9] : [30, 20, 14, 10, 8];
    const opacity = [1, 0.32, 0.15, 0.07, 0.03][d];

    return (
      <View style={styles.itemView}>
        <Text
          style={{ fontSize: sizes[d], opacity, color: '#FFFFFF', fontFamily: SERIF }}
          numberOfLines={1}
        >
          {item.value}
        </Text>
      </View>
    );
  }, [selVi, isPrimary]);

  return (
    <View style={styles.container}>
      {/* Hairline selection frame centred on row 2 of 5 */}
      <View pointerEvents="none" style={styles.frame} />

      <FlatList<Row>
        ref={listRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={r => r.id}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialScrollIndex}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        onScrollEndDrag={onDragEnd}
        style={{ height: PICKER_HEIGHT }}
        // Virtualisation tuning
        windowSize={5}
        maxToRenderPerBatch={12}
        initialNumToRender={VISIBLE + 4}
        removeClippedSubviews
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  frame: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 1,
  },
  spacer:   { height: ITEM_HEIGHT },
  itemView: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
});
