import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, shadow, spacing, typography } from '@/theme';
import type { Plant } from '@/types/models';
import { parseUtc, relativeDue } from '@/lib/date';
import { PlantThumb } from './PlantThumb';
import { WaterButton } from './WaterButton';

interface Props {
  plant: Plant;
  onPress: () => void;
  onWater: () => void;
  watering?: boolean;
  showDue?: boolean;
}

export function PlantCard({ plant, onPress, onWater, watering, showDue = false }: Props) {
  const due = parseUtc(plant.next_due_at);
  const meta: string[] = [];
  if (plant.water_amount_ml) meta.push(`~ ${plant.water_amount_ml} ml`);
  if (plant.location) meta.push(plant.location);

  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
      <PlantThumb uri={plant.photo_url} size={64} />
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {plant.name}
        </Text>
        {meta.length > 0 && (
          <View style={styles.metaRow}>
            <Ionicons name="water-outline" size={14} color={colors.textMuted} />
            <Text style={styles.meta} numberOfLines={1}>
              {meta.join('  ·  ')}
            </Text>
          </View>
        )}
        {showDue && (
          <Text style={styles.due} numberOfLines={1}>
            {relativeDue(due)}
          </Text>
        )}
      </View>
      <WaterButton onWater={onWater} busy={watering} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.soft,
  },
  middle: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  name: { ...typography.cardTitle, color: colors.text },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.meta,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  due: {
    ...typography.small,
    color: colors.textFaint,
    marginTop: spacing.xs,
  },
});
