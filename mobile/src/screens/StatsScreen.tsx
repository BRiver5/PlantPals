import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { Screen } from '@/components/Screen';
import { StatTile } from '@/components/StatTile';
import { BarChart } from '@/components/BarChart';
import { EmptyState, ErrorView, LoadingView } from '@/components/ui';
import { colors, radius, shadow, spacing, typography } from '@/theme';
import { api } from '@/lib/api';
import type { Stats } from '@/types/models';

export function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      setStats(await api.stats());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your stats.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>Your garden</Text>
      <Text style={styles.subtitle}>Watering at a glance</Text>
    </View>
  );

  if (!stats && error) {
    return (
      <Screen padded>
        {header}
        <ErrorView message={error} onRetry={() => load()} />
      </Screen>
    );
  }

  if (!stats) {
    return (
      <Screen padded>
        {header}
        <LoadingView />
      </Screen>
    );
  }

  if (stats.total_plants === 0) {
    return (
      <Screen padded>
        {header}
        <EmptyState
          icon="stats-chart-outline"
          title="No stats yet"
          message="Add a plant and log a few waterings — your streaks and weekly activity will show up here."
        />
      </Screen>
    );
  }

  const chartData = stats.weekly.map((w) => ({ label: w.label, value: w.count }));
  const streakLabel = stats.current_streak === 1 ? 'day streak' : 'days streak';

  return (
    <Screen padded>
      {header}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.water} />}
      >
        <View style={styles.streakCard}>
          <View style={styles.streakIcon}>
            <Ionicons name="flame" size={26} color={colors.textOnAccent} />
          </View>
          <View style={styles.streakText}>
            <Text style={styles.streakValue}>
              {stats.current_streak} {streakLabel}
            </Text>
            <Text style={styles.streakSub}>
              {stats.current_streak > 0
                ? 'Keep it going — water on time to grow your streak.'
                : 'Water a plant today to start a new streak.'}
              {stats.best_streak > 0 ? `  ·  Best: ${stats.best_streak}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.tileRow}>
          <StatTile icon="leaf" value={stats.total_plants} label="Plants" tint={colors.green} tintSoft={colors.greenSoft} />
          <StatTile icon="water" value={stats.waterings_this_month} label="Watered this month" />
        </View>
        <View style={[styles.tileRow, styles.tileRowGap]}>
          <StatTile
            icon="alert-circle"
            value={stats.due_today + stats.overdue}
            label="Due now"
            tint={colors.warning}
            tintSoft="#FBEEDD"
          />
          <StatTile icon="checkmark-done" value={stats.waterings_total} label="Total waterings" tint={colors.green} tintSoft={colors.greenSoft} />
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Waterings per week</Text>
          <Text style={styles.chartSub}>Last 8 weeks</Text>
          <BarChart data={chartData} height={170} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.meta, color: colors.textMuted, marginTop: 2 },
  content: { paddingBottom: spacing.xxl },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  streakIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: { flex: 1, marginLeft: spacing.lg },
  streakValue: { ...typography.section, color: colors.textOnAccent },
  streakSub: { ...typography.small, color: 'rgba(255,255,255,0.85)', marginTop: 2, lineHeight: 17 },
  tileRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  tileRowGap: { marginTop: spacing.md },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadow.soft,
  },
  chartTitle: { ...typography.section, color: colors.text },
  chartSub: { ...typography.small, color: colors.textFaint, marginBottom: spacing.lg },
});
