import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDED = 'plantpals.onboarded';
const SETTINGS = 'plantpals.settings';

export interface AppSettings {
  notificationsEnabled: boolean;
  reminderHour: number; // 0-23, local time the reminder fires
  reminderMinute: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  reminderHour: 9,
  reminderMinute: 0,
};

export async function getOnboarded(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDED)) === '1';
}

export async function setOnboarded(value: boolean): Promise<void> {
  if (value) {
    await AsyncStorage.setItem(ONBOARDED, '1');
  } else {
    await AsyncStorage.removeItem(ONBOARDED);
  }
}

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS, JSON.stringify(settings));
}

export async function clearLocalData(): Promise<void> {
  await AsyncStorage.multiRemove([ONBOARDED, SETTINGS, 'plantpals.notif_map']);
}
