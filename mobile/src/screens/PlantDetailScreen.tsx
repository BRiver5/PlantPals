import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Screen } from '@/components/Screen';
import { NavHeader } from '@/components/NavHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BarChart, BarDatum } from '@/components/BarChart';
import { LoadingView, ErrorView } from '@/components/ui';
import { colors, motion, radius, shadow, spacing, typography } from '@/theme';
import { api } from '@/lib/api';
import { usePlants } from '@/state/PlantsContext';
import { formatDate, formatDateTime, parseUtc, relativeDue, startOfDay } from '@/lib/date';
import type { PlantDetail, WateringLog } from '@/types/models';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'PlantDetail'>;

const LAYOUT = LinearTransition.duration(motion.base.duration).easing(motion.base.easing);

/** Builds a 30-day chart: waterings grouped into six trailing 5-day windows. */
function buildChart(logs: WateringLog[]): BarDatum[] {
  const windows = 6;
  const spanDays = 5;
  const today = startOfDay(new Date());
  const buckets: BarDatum[] = [];
  for (let i = windows - 1; i >= 0; i--) {
    const end = new Date(today);
    end.setDate(end.getDate() - i * spanDays);
    const start = new Date(end);
    start.setDate(start.getDate() - (spanDays - 1));
    const count = logs.filter((l) => {
      const d = startOfDay(parseUtc(l.watered_at)).getTime();
      return d >= start.getTime() && d <= end.getTime();
    }).length;
    buckets.push({ label: start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value: count });
  }
  return buckets;
}

export function PlantDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { plantId } = route.params;
  const { waterPlant, deletePlant, refresh } = usePlants();

  const [detail, setDetail] = useState<PlantDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setDetail(await api.getPlant(plantId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this plant.');
    }
  }, [plantId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onWater = async () => {
    setBusy(true);
    try {
      const updated = await waterPlant(plantId);
      setDetail((prev) => (prev ? { ...prev, ...updated } : updated));
    } catch (e) {
      Alert.alert('Could not log watering', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
  };

  const onDeleteLog = (logId: number) => {
    Alert.alert('Remove this watering?', 'This will update the next watering date.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteWatering(plantId, logId);
            await load();
            await refresh();
          } catch (e) {
            Alert.alert('Could not remove watering', e instanceof Error ? e.message : '');
          }
        },
      },
    ]);
  };

  const onDeletePlant = () => {
    Alert.alert('Delete plant?', `“${detail?.name}” and its watering history will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePlant(plantId);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Could not delete', e instanceof Error ? e.message : '');
          }
        },
      },
    ]);
  };

  if (error && !detail) {
    return (
      <Screen padded>
        <NavHeader title="Plant" />
        <ErrorView message={error} onRetry={load} />
      </Screen>
    );
  }

  if (!detail) {
    return (
      <Screen padded>
        <NavHeader title="Plant" />
        <LoadingView />
      </Screen>
    );
  }

  const due = parseUtc(detail.next_due_at);
  const chart = buildChart(detail.logs);
  const hasHistory = detail.logs.length > 0;

  return (
    <Screen padded edges={['top', 'bottom']}>
      <NavHeader
        title={detail.name}
        right={
          <Pressable
            onPress={() => navigation.navigate('AddEditPlant', { plantId })}
            hitSlop={8}
            accessibilityLabel="Edit plant"
          >
            <Ionicons name="create-outline" size={22} color={colors.text} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {detail.photo_url ? (
            <Image source={{ uri: detail.photo_url }} style={styles.heroImage} contentFit="cover" transition={200} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="leaf-outline" size={64} color={colors.green} />
            </View>
          )}
        </View>

        <Text style={styles.name}>{detail.name}</Text>
        {detail.species ? <Text style={styles.species}>{detail.species}</Text> : null}

        <View style={styles.factRow}>
          <Fact icon="repeat" label="Every" value={`${detail.interval_days}d`} />
          <Fact
            icon="water"
            label="Amount"
            value={detail.water_amount_ml ? `${detail.water_amount_ml}ml` : '—'}
          />
          <Fact icon="time-outline" label="Next" value={relativeDue(due)} />
        </View>

        {detail.location ? (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <Text style={styles.locationText}>{detail.location}</Text>
          </View>
        ) : null}

        <PrimaryButton
          label="Water now"
          icon="water"
          onPress={onWater}
          loading={busy}
          style={styles.waterNow}
        />

        {detail.care_notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Care notes</Text>
            <Text style={styles.notes}>{detail.care_notes}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last 30 days</Text>
          {hasHistory ? (
            <BarChart data={chart} height={140} />
          ) : (
            <Text style={styles.mutedNote}>
              No waterings logged yet. Tap “Water now” and your history will appear here.
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Watering history</Text>
          {hasHistory ? (
            detail.logs.map((log) => (
              <Animated.View
                key={log.id}
                layout={LAYOUT}
                entering={FadeIn.duration(motion.base.duration)}
                exiting={FadeOut.duration(motion.fast.duration)}
                style={styles.logRow}
              >
                <View style={styles.logDot} />
                <Text style={styles.logText}>{formatDateTime(parseUtc(log.watered_at))}</Text>
                <Pressable onPress={() => onDeleteLog(log.id)} hitSlop={10} accessibilityLabel="Remove watering">
                  <Ionicons name="close-circle" size={20} color={colors.textFaint} />
                </Pressable>
              </Animated.View>
            ))
          ) : (
            <Text style={styles.mutedNote}>Nothing logged yet.</Text>
          )}
        </View>

        <View style={styles.metaCard}>
          <Text style={styles.metaText}>Added {formatDate(parseUtc(detail.created_at))}</Text>
          {detail.last_watered_at ? (
            <Text style={styles.metaText}>
              Last watered {formatDate(parseUtc(detail.last_watered_at))}
            </Text>
          ) : null}
        </View>

        <PrimaryButton label="Delete plant" icon="trash-outline" variant="danger" onPress={onDeletePlant} style={styles.delete} />
      </ScrollView>
    </Screen>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={18} color={colors.water} />
      <Text style={styles.factValue}>{value}</Text>
      <Text style={styles.factLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  hero: { borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  heroImage: { width: '100%', height: 220, borderRadius: radius.lg, backgroundColor: colors.greenSoft },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  name: { ...typography.title, color: colors.text, marginTop: spacing.lg },
  species: { ...typography.body, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  factRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  fact: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadow.soft,
  },
  factValue: { ...typography.cardTitle, color: colors.text, marginTop: spacing.xs },
  factLabel: { ...typography.small, color: colors.textFaint, marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  locationText: { ...typography.meta, color: colors.textMuted, marginLeft: spacing.xs },
  waterNow: { marginTop: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadow.soft,
  },
  cardTitle: { ...typography.label, color: colors.text, marginBottom: spacing.md },
  notes: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
  mutedNote: { ...typography.meta, color: colors.textMuted, lineHeight: 20 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.water,
    marginRight: spacing.md,
  },
  logText: { ...typography.body, color: colors.text, flex: 1 },
  metaCard: { marginTop: spacing.lg, paddingHorizontal: spacing.xs },
  metaText: { ...typography.small, color: colors.textFaint, marginTop: 2 },
  delete: { marginTop: spacing.xl },
});
