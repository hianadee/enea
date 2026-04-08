import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { spacing, borderRadius, shadow } from '@/design-system/tokens/spacing';

interface CardProps {
  variant?: 'default' | 'elevated' | 'interactive';
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  style,
  onPress,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      backgroundColor: colors.bg.elevated,
      borderColor: colors.border,
      borderWidth: 1,
    };

    const variantStyles = {
      default: {
        ...shadow.medium,
      },
      elevated: {
        borderColor: colors.primary.action,
        borderWidth: 1.5,
        ...shadow.glow,
      },
      interactive: {
        ...shadow.medium,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  return (
    <View style={[getCardStyle(), style]} onTouchEnd={onPress}>
      {children}
    </View>
  );
};

export default Card;
