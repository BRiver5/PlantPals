import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, shadow } from '@/theme';

interface Props {
  onWater: () => void;
  busy?: boolean;
  size?: number;
}

/**
 * Circular water-drop action. On tap the droplet "fills" from the bottom and the
 * button gives a single calm pulse (scale 1 → 1.06 → 1, all timing, no spring/bounce),
 * then invokes onWater. The parent list handles the card's exit animation.
 */
export function WaterButton({ onWater, busy = false, size = 52 }: Props) {
  const fill = useSharedValue(0); // 0 = empty, 1 = full
  const scale = useSharedValue(1);

  const trigger = () => {
    fill.value = withTiming(1, motion.gentle);
    scale.value = withSequence(
      withTiming(1.06, { duration: 140, easing: motion.fast.easing }),
      withTiming(1, { duration: 200, easing: motion.base.easing }),
    );
    onWater();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(fill.value, [0, 1], [colors.surface, colors.water]),
  }));

  const fillStyle = useAnimatedStyle(() => ({
    height: `${fill.value * 100}%`,
  }));

  const iconColorStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  const iconTintStyle = useAnimatedStyle(() => ({
    // icon fades from water-blue to white as the fill rises past the midpoint
    opacity: fill.value,
  }));

  return (
    <Pressable onPress={trigger} disabled={busy} accessibilityRole="button" accessibilityLabel="Mark as watered">
      <Animated.View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
          containerStyle,
        ]}
      >
        <Animated.View style={[styles.fill, fillStyle]} pointerEvents="none" />
        {busy ? (
          <ActivityIndicator color={colors.water} />
        ) : (
          <View style={styles.iconStack}>
            <Animated.View style={iconColorStyle}>
              <Ionicons name="water" size={size * 0.42} color={colors.water} />
            </Animated.View>
            <Animated.View style={[styles.iconOverlay, iconTintStyle]}>
              <Ionicons name="water" size={size * 0.42} color={colors.textOnAccent} />
            </Animated.View>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.soft,
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.water,
  },
  iconStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
