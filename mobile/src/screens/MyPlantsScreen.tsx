import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Screen } from '@/components/Screen';
import { PlantCard } from '@/components/PlantCard';
import { EmptyState, ErrorView, LoadingView } from '@/components/ui';
import { colors, motion, radius, shadow, spacing, typography } from '@/theme';
import { usePlants } from '@/state/PlantsContext';
import { groupByDueDate } from '@/lib/date';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CARD_LAYOUT = LinearTransition.duration(motion.base.duration).easing(motion.base.easing);
const ENTER = FadeIn.duration(motion.base.duration);
const EXIT = FadeOut.duration(motion.fast.duration);

const BUCKET_STYLE: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  overdue: { color: colors.warning, icon: 'alert-circle' },
  today: { color: colors.water, icon: 'water' },
  upcoming: { color: colors.textMuted, icon: 'calendar-outline' },
};

export function MyPlantsScreen() {
  const navigation = useNavigation<Nav>();
  const { plants, loading, refreshing, error, refresh, waterPlant } = usePlants();
  const [wateringId, setWateringId] = useState<number | null>(null);

  const onWater = useCallback(
    async (id: number) => {
      setWateringId(id);
      try {
        await waterPlant(id);
      } finally {
        setWateringId(null);
      }
    },
    [waterPlant],
  );

  const groups = groupByDueDate(plants);

  const header = (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>My Plants</Text>
        <Text style={styles.subtitle}>
          {plants.length === 0
            ? 'Let’s get growing'
            : `${plants.length} plant${plants.length === 1 ? '' : 's'}`}
        </Text>
      </View>
      <Pressable
        onPress={() => navigation.navigate('AddEditPlant')}
        style={styles.addButton}
        accessibilityRole="button"
        accessibilityLabel="Add a plant"
      >
        <Ionicons name="add" size={26} color={colors.textOnAccent} />
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <Screen padded>
        {header}
        <LoadingView label="Loading your plants…" />
      </Screen>
    );
  }

  if (error && plants.length === 0) {
    return (
      <Screen padded>
        {header}
        <ErrorView message={error} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <Screen padded>
      {header}
      {plants.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.water} />}
        >
          <EmptyState
            icon="leaf-outline"
            title="No plants yet"
            message="Add your first plant and PlantPals will remind you when it’s time to water."
            actionLabel="Add your first plant"
            onAction={() => navigation.navigate('AddEditPlant')}
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.water} />}
        >
          {groups.map((group) => {
            const bs = BUCKET_STYLE[group.bucket];
            return (
              <Animated.View key={group.key} layout={CARD_LAYOUT} style={styles.group}>
                <View style={styles.groupHeader}>
                  <Ionicons name={bs.icon} size={16} color={bs.color} />
                  <Text style={[styles.groupTitle, { color: bs.color }]}>{group.label}</Text>
                  <Text style={styles.groupCount}>{group.items.length}</Text>
                </View>
                {group.items.map((plant) => (
                  <Animated.View
                    key={plant.id}
                    layout={CARD_LAYOUT}
                    entering={ENTER}
                    exiting={EXIT}
                    style={styles.cardWrap}
                  >
                    <PlantCard
                      plant={plant}
                      watering={wateringId === plant.id}
                      showDue={group.bucket !== 'today'}
                      onPress={() => navigation.navigate('PlantDetail', { plantId: plant.id })}
                      onWater={() => onWater(plant.id)}
                    />
                  </Animated.View>
                ))}
              </Animated.View>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.meta, color: colors.textMuted, marginTop: 2 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.water,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  emptyScroll: { flexGrow: 1, justifyContent: 'center' },
  listContent: { paddingBottom: spacing.xxl },
  group: { marginBottom: spacing.lg },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  groupTitle: { ...typography.label, marginLeft: spacing.sm, flex: 1 },
  groupCount: { ...typography.small, color: colors.textFaint },
  cardWrap: { marginBottom: spacing.md },
});
