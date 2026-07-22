import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import type { Plant } from '@/types/models';
import type { AppSettings } from './storage';
import { parseUtc, startOfDay } from './date';

const MAP_KEY = 'plantpals.notif_map';
const CHANNEL_ID = 'watering-reminders';

// Foreground presentation: show a banner, no sound/badge (calm, non-intrusive).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let configured = false;

/** One-time setup: Android notification channel. Safe to call repeatedly. */
export async function configureNotifications(): Promise<void> {
  if (configured) return;
  configured = true;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Watering reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#4FA8E0',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

export async function getPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/** Requests permission (returns true if granted). No-op success on non-physical devices. */
export async function requestPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    // Simulators/emulators may not deliver notifications, but we still allow scheduling.
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return true;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function loadMap(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(MAP_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

async function saveMap(map: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(MAP_KEY, JSON.stringify(map));
}

/** The moment a plant's reminder should fire: due calendar day at the reminder time. */
function triggerDate(plant: Plant, settings: AppSettings): Date {
  const due = startOfDay(parseUtc(plant.next_due_at));
  due.setHours(settings.reminderHour, settings.reminderMinute, 0, 0);
  return due;
}

async function cancelId(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Already fired or removed — ignore.
  }
}

/** Cancels any pending reminder for a single plant. */
export async function cancelForPlant(plantId: number): Promise<void> {
  const map = await loadMap();
  const id = map[String(plantId)];
  if (id) {
    await cancelId(id);
    delete map[String(plantId)];
    await saveMap(map);
  }
}

/**
 * Schedules (or reschedules) the reminder for one plant.
 * Skips scheduling when notifications are disabled or the due time is already past
 * (the plant is then surfaced in the app's "Water Today"/"Overdue" list instead).
 */
export async function scheduleForPlant(plant: Plant, settings: AppSettings): Promise<void> {
  await cancelForPlant(plant.id);
  if (!settings.notificationsEnabled) return;

  const when = triggerDate(plant, settings);
  if (when.getTime() <= Date.now()) return;

  const amount = plant.water_amount_ml ? ` (~${plant.water_amount_ml} ml)` : '';
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to water 🌿',
      body: `${plant.name} is thirsty${amount}.`,
      data: { plantId: plant.id },
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
  });

  const map = await loadMap();
  map[String(plant.id)] = id;
  await saveMap(map);
}

/** Cancels every scheduled reminder and clears the mapping. */
export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(MAP_KEY);
}

/** Rebuilds all reminders from the current plant list (called after settings changes). */
export async function rescheduleAll(plants: Plant[], settings: AppSettings): Promise<void> {
  await cancelAll();
  if (!settings.notificationsEnabled) return;
  for (const plant of plants) {
    await scheduleForPlant(plant, settings);
  }
}
