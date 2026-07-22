import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radius, spacing, typography } from '@/theme';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  maxLength?: number;
  suffix?: string;
  optional?: boolean;
  autoFocus?: boolean;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  maxLength,
  suffix,
  optional,
  autoFocus,
}: Props) {
  const [focused, setFocused] = useState(false);
  const focus = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [colors.border, colors.water]),
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional && <Text style={styles.optional}>Optional</Text>}
      </View>
      <Animated.View style={[styles.inputWrap, multiline && styles.inputWrapMultiline, borderStyle]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          autoFocus={autoFocus}
          style={[styles.input, multiline && styles.inputMultiline]}
          onFocus={() => {
            setFocused(true);
            focus.value = withTiming(1, motion.fast);
          }}
          onBlur={() => {
            setFocused(false);
            focus.value = withTiming(0, motion.fast);
          }}
        />
        {suffix && !multiline ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: { ...typography.label, color: colors.text },
  optional: { ...typography.small, color: colors.textFaint },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  inputWrapMultiline: { alignItems: 'flex-start', paddingVertical: spacing.md },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
  suffix: { ...typography.body, color: colors.textMuted, marginLeft: spacing.sm },
});
