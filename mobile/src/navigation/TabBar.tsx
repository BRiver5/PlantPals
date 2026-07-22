import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { colors, motion, radius, shadow, spacing } from '@/theme';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  MyPlants: { active: 'leaf', inactive: 'leaf-outline' },
  Stats: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

function TabButton({
  focused,
  routeName,
  onPress,
}: {
  focused: boolean;
  routeName: string;
  onPress: () => void;
}) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, motion.base);
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: 0.8 + progress.value * 0.2 }],
  }));

  const iconWrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -progress.value * 2 }],
  }));

  const icon = ICONS[routeName] ?? ICONS.MyPlants;

  return (
    <Pressable style={styles.tab} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: focused }}>
      <Animated.View style={[styles.pill, pillStyle]} />
      <Animated.View style={iconWrapStyle}>
        <Ionicons
          name={focused ? icon.active : icon.inactive}
          size={24}
          color={focused ? colors.water : colors.textFaint}
        />
      </Animated.View>
    </Pressable>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          return (
            <TabButton key={route.key} focused={focused} routeName={route.name} onPress={onPress} />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    ...shadow.card,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  pill: {
    position: 'absolute',
    width: 48,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.waterSoft,
  },
});
