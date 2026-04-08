import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { spacing, borderRadius } from '@/design-system/tokens/spacing';
import { typography } from '@/design-system/tokens/typography';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onPress: () => void;
  children: string;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onPress,
  children,
  style,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    };

    const sizeStyles = {
      sm: { paddingVertical: spacing.sm },
      md: { paddingVertical: spacing.md },
      lg: { paddingVertical: spacing.lg },
    };

    const variantStyles = {
      primary: {
        backgroundColor: disabled ? colors.primary.action : colors.primary.action,
        opacity: disabled ? 0.4 : 1,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary.action,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const variantTextColors = {
      primary: colors.primary.dark,
      secondary: colors.primary.action,
      ghost: colors.primary.action,
    };

    return {
      ...typography.presets.labelLarge,
      color: disabled ? colors.fg.secondary : variantTextColors[variant],
      fontFamily: typography.fontFamily.sans,
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{children}</Text>
    </TouchableOpacity>
  );
};

export default Button;
