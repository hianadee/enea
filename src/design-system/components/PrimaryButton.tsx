import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accentColor?: string;
  style?: ViewStyle;
  variant?: 'filled' | 'outline' | 'ghost';
}

export const PrimaryButton: React.FC<Props> = ({
  label,
  onPress,
  disabled,
  loading,
  accentColor = '#C4B5FD',
  style,
  variant = 'filled',
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.button,
        variant === 'filled' && { backgroundColor: accentColor },
        variant === 'outline' && { borderWidth: 1, borderColor: accentColor },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'filled' ? COLORS.dark.background : accentColor}
          size="small"
          accessibilityLabel="Cargando"
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'filled' && { color: COLORS.dark.background },
            variant !== 'filled' && { color: accentColor },
          ]}
          accessibilityElementsHidden={true}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.4,
  },
});
