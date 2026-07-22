import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radius, spacing, typography } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const PALETTE: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.water, fg: colors.textOnAccent },
  secondary: { bg: colors.green, fg: colors.textOnAccent },
  ghost: { bg: 'transparent', fg: colors.text, border: colors.border },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

/** Button with a subtle timing-based press-down (scale + opacity), never a spring. */
export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}: Props) {
  const pressed = useSharedValue(0);
  const p = PALETTE[variant];
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
    opacity: 1 - pressed.value * 0.12,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => {
          pressed.value = withTiming(1, motion.fast);
        }}
        onPressOut={() => {
          pressed.value = withTiming(0, motion.fast);
        }}
        accessibilityRole="button"
        style={[
          styles.button,
          { backgroundColor: p.bg },
          p.border ? { borderWidth: 1, borderColor: p.border } : null,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={p.fg} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={18} color={p.fg} style={styles.icon} />}
            <Text style={[styles.label, { color: p.fg }]}>{label}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
  },
  disabled: { opacity: 0.5 },
  icon: { marginRight: spacing.sm },
  label: { ...typography.cardTitle },
});
