import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { Screen } from '@/components/Screen';
import { colors, radius, shadow, spacing, typography } from '@/theme';
import { useSettings } from '@/state/SettingsContext';
import { useApp } from '@/state/AppContext';
import { usePlants } from '@/state/PlantsContext';
import { getPermissionStatus, requestPermission } from '@/lib/notifications';

function formatTime(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function SettingsScreen() {
  const { settings, update } = useSettings();
  const { resetAll } = useApp();
  const { refresh } = usePlants();
  const [showPicker, setShowPicker] = useState(false);

  const toggleNotifications = async (value: boolean) => {
    if (value) {
      const status = await getPermissionStatus();
      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Reminders are turned off',
            'To receive watering reminders, enable notifications for PlantPals in your device settings.',
          );
          return;
        }
      }
    }
    await update({ notificationsEnabled: value });
  };

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && date) {
      update({ reminderHour: date.getHours(), reminderMinute: date.getMinutes() });
    }
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset all data?',
      'This permanently removes every plant, watering log, and preference from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            await refresh();
          },
        },
      ],
    );
  };

  const reminderDate = new Date();
  reminderDate.setHours(settings.reminderHour, settings.reminderMinute, 0, 0);

  return (
    <Screen padded>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.groupLabel}>Reminders</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="notifications-outline" size={20} color={colors.water} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Watering reminders</Text>
              <Text style={styles.rowSub}>Local notifications when a plant is due</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ true: colors.water, false: colors.border }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <Pressable
            style={styles.row}
            onPress={() => setShowPicker(true)}
            disabled={!settings.notificationsEnabled}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="time-outline" size={20} color={colors.water} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, !settings.notificationsEnabled && styles.disabledText]}>
                Reminder time
              </Text>
              <Text style={styles.rowSub}>When each day’s reminders arrive</Text>
            </View>
            <Text style={[styles.rowValue, !settings.notificationsEnabled && styles.disabledText]}>
              {formatTime(settings.reminderHour, settings.reminderMinute)}
            </Text>
          </Pressable>
        </View>

        {showPicker && (
          <View style={styles.pickerWrap}>
            <DateTimePicker
              value={reminderDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
            {Platform.OS === 'ios' && (
              <Pressable style={styles.pickerDone} onPress={() => setShowPicker(false)}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </Pressable>
            )}
          </View>
        )}

        <Text style={styles.groupLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colors.greenSoft }]}>
              <Ionicons name="leaf-outline" size={20} color={colors.green} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>PlantPals</Text>
              <Text style={styles.rowSub}>Keep your green friends happy</Text>
            </View>
            <Text style={styles.rowValue}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
          </View>
        </View>

        <Text style={styles.groupLabel}>Data</Text>
        <Pressable style={styles.resetButton} onPress={confirmReset}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={styles.resetText}>Reset all data</Text>
        </Pressable>
        <Text style={styles.resetHint}>
          PlantPals stores your plants under an anonymous ID on this device. Resetting clears
          everything and starts fresh.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { ...typography.hero, color: colors.text },
  content: { paddingBottom: spacing.xxl },
  groupLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    ...shadow.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.waterSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, marginLeft: spacing.md },
  rowTitle: { ...typography.cardTitle, color: colors.text },
  rowSub: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  rowValue: { ...typography.body, color: colors.water, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: spacing.lg + 40 + spacing.md },
  disabledText: { color: colors.textFaint },
  pickerWrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: spacing.md,
    ...shadow.soft,
  },
  pickerDone: { alignItems: 'flex-end', padding: spacing.md },
  pickerDoneText: { ...typography.cardTitle, color: colors.water },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    height: 54,
  },
  resetText: { ...typography.cardTitle, color: colors.danger, marginLeft: spacing.sm },
  resetHint: {
    ...typography.small,
    color: colors.textFaint,
    marginTop: spacing.md,
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
});
