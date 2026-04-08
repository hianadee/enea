import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors } from '@/design-system/tokens/colors';
import { spacing, borderRadius } from '@/design-system/tokens/spacing';
import { typography } from '@/design-system/tokens/typography';

interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: boolean;
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error = false,
  style,
  placeholder,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[typography.presets.labelLarge, styles.label]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.fg.secondary}
        {...props}
      />
      {helperText && (
        <Text style={[typography.presets.caption, styles.helperText]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.fg.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(26, 35, 50, 0.8)',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.fg.primary,
    fontSize: typography.fontSize.body,
    fontFamily: typography.fontFamily.sans,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  helperText: {
    color: colors.fg.secondary,
    marginTop: spacing.sm,
  },
});

export default Input;
