import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { configureNotifications, cancelAll } from '@/lib/notifications';
import { getOnboarded, setOnboarded, clearLocalData } from '@/lib/storage';
import { initDatabase, clearDatabase } from '@/db/database';

interface AppContextValue {
  ready: boolean;
  onboarded: boolean;
  completeOnboarding: () => Promise<void>;
  /** Wipes local identity + preferences and starts over (used by "reset data"). */
  resetAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboardedState] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      await initDatabase();
      await configureNotifications();
      const done = await getOnboarded();
      if (active) {
        setOnboardedState(done);
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setOnboarded(true);
    setOnboardedState(true);
  }, []);

  const resetAll = useCallback(async () => {
    await cancelAll();
    await clearDatabase();
    await clearLocalData();
    setOnboardedState(false);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({ ready, onboarded, completeOnboarding, resetAll }),
    [ready, onboarded, completeOnboarding, resetAll],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
