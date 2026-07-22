import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from '@/lib/storage';

interface SettingsContextValue {
  settings: AppSettings;
  ready: boolean;
  update: (patch: Partial<AppSettings>) => Promise<AppSettings>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadSettings().then((s) => {
      if (active) {
        setSettings(s);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      ready,
      update: async (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        await saveSettings(next);
        return next;
      },
    }),
    [settings, ready],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
