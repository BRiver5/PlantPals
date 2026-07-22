import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radius, spacing, typography } from '@/theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export interface BarDatum {
  label: string;
  value: number;
}

interface Props {
  data: BarDatum[];
  height?: number;
  color?: string;
  /** Optional caption under each bar; defaults to datum.label. */
  showValues?: boolean;
}

function Bar({
  x,
  width,
  fullHeight,
  ratio,
  color,
}: {
  x: number;
  width: number;
  fullHeight: number;
  ratio: number;
  color: string;
}) {
  const grow = useSharedValue(0);

  useEffect(() => {
    grow.value = withTiming(ratio, motion.emphasized);
  }, [ratio, grow]);

  const animatedProps = useAnimatedProps(() => {
    const h = Math.max(grow.value * fullHeight, ratio > 0 ? 3 : 0);
    return { y: fullHeight - h, height: h };
  });

  return (
    <AnimatedRect
      x={x}
      width={width}
      rx={width / 2.6}
      fill={color}
      animatedProps={animatedProps}
    />
  );
}

/**
 * Minimal responsive bar chart drawn with react-native-svg. Bars grow from the
 * baseline on mount with a single timing tween (no bounce). Renders an empty
 * baseline gracefully when every value is zero.
 */
export function BarChart({ data, height = 160, color = colors.water, showValues = true }: Props) {
  const [width, setWidth] = React.useState(0);
  const max = Math.max(1, ...data.map((d) => d.value));
  const count = Math.max(1, data.length);
  const gap = spacing.sm;
  const barWidth = width > 0 ? Math.max((width - gap * (count - 1)) / count, 6) : 0;

  return (
    <View>
      <View
        style={{ height }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {width > 0 && (
          <Svg width={width} height={height}>
            {data.map((d, i) => (
              <Bar
                key={i}
                x={i * (barWidth + gap)}
                width={barWidth}
                fullHeight={height}
                ratio={d.value / max}
                color={color}
              />
            ))}
          </Svg>
        )}
      </View>
      {showValues && (
        <View style={styles.labels}>
          {data.map((d, i) => (
            <View key={i} style={styles.labelCol}>
              <Text style={styles.value}>{d.value}</Text>
              <Text style={styles.label} numberOfLines={1}>
                {d.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  labelCol: { flex: 1, alignItems: 'center' },
  value: { ...typography.small, color: colors.text, fontWeight: '700' },
  label: { ...typography.small, color: colors.textFaint, marginTop: 2 },
});

export const chartRadius = radius.sm;
