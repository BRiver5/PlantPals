import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { api } from '@/lib/api';
import { cancelForPlant, rescheduleAll, scheduleForPlant } from '@/lib/notifications';
import type { Plant, PlantDetail, PlantInput } from '@/types/models';
import { useSettings } from './SettingsContext';

interface PlantsContextValue {
  plants: Plant[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createPlant: (input: PlantInput) => Promise<PlantDetail>;
  updatePlant: (id: number, input: Partial<PlantInput>) => Promise<PlantDetail>;
  deletePlant: (id: number) => Promise<void>;
  waterPlant: (id: number) => Promise<PlantDetail>;
}

const PlantsContext = createContext<PlantsContextValue | null>(null);

export function PlantsProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedOnce = useRef(false);

  const load = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true);
    else if (!loadedOnce.current) setLoading(true);
    setError(null);
    try {
      const data = await api.listPlants();
      setPlants(data);
      loadedOnce.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  const createPlant = useCallback(async (input: PlantInput) => {
    const created = await api.createPlant(input);
    setPlants((prev) => sortPlants([...prev, created]));
    await scheduleForPlant(created, settingsRef.current);
    return created;
  }, []);

  const updatePlant = useCallback(async (id: number, input: Partial<PlantInput>) => {
    const updated = await api.updatePlant(id, input);
    setPlants((prev) => sortPlants(prev.map((p) => (p.id === id ? updated : p))));
    await scheduleForPlant(updated, settingsRef.current);
    return updated;
  }, []);

  const deletePlant = useCallback(async (id: number) => {
    await api.deletePlant(id);
    setPlants((prev) => prev.filter((p) => p.id !== id));
    await cancelForPlant(id);
  }, []);

  const waterPlant = useCallback(async (id: number) => {
    const updated = await api.waterPlant(id);
    setPlants((prev) => sortPlants(prev.map((p) => (p.id === id ? updated : p))));
    await scheduleForPlant(updated, settingsRef.current);
    return updated;
  }, []);

  // Whenever the reminder time / enabled flag changes, rebuild every reminder.
  const prevSettingsSig = useRef<string>('');
  useEffect(() => {
    const sig = `${settings.notificationsEnabled}|${settings.reminderHour}|${settings.reminderMinute}`;
    if (prevSettingsSig.current && prevSettingsSig.current !== sig && loadedOnce.current) {
      rescheduleAll(plants, settings);
    }
    prevSettingsSig.current = sig;
  }, [settings, plants]);

  const value = useMemo<PlantsContextValue>(
    () => ({
      plants,
      loading,
      refreshing,
      error,
      refresh,
      createPlant,
      updatePlant,
      deletePlant,
      waterPlant,
    }),
    [plants, loading, refreshing, error, refresh, createPlant, updatePlant, deletePlant, waterPlant],
  );

  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>;
}

function sortPlants(list: Plant[]): Plant[] {
  return [...list].sort((a, b) => {
    const t = new Date(a.next_due_at).getTime() - new Date(b.next_due_at).getTime();
    return t !== 0 ? t : a.name.localeCompare(b.name);
  });
}

export function usePlants(): PlantsContextValue {
  const ctx = useContext(PlantsContext);
  if (!ctx) throw new Error('usePlants must be used within PlantsProvider');
  return ctx;
}
