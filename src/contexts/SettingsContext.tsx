import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform, NativeModules } from 'react-native';
import { AppSettings, loadSettings, saveSettings } from '../services/storage';

function detectDefaults(): { language: 'ko' | 'en'; currency: 'KRW' | 'USD' } {
  try {
    const locale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager?.settings?.AppleLocale ??
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ??
          ''
        : NativeModules.I18nManager?.localeIdentifier ?? '';
    const lang = locale.startsWith('ko') ? 'ko' : 'en';
    const currency = lang === 'ko' ? 'KRW' : 'USD';
    return { language: lang, currency };
  } catch {
    return { language: 'ko', currency: 'KRW' };
  }
}

const defaults = detectDefaults();
const DEFAULT_SETTINGS: AppSettings = {
  bottlePrice: defaults.currency === 'USD' ? 2 : 2000,
  glassesPerBottle: 7,
  language: defaults.language,
  currency: defaults.currency,
};

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings().then((s) => {
      // Merge device defaults for new fields that may not exist in stored settings
      const merged = { ...DEFAULT_SETTINGS, ...s };
      setSettings(merged);
      setLoading(false);
    });
  }, []);

  const updateSettings = async (partial: Partial<AppSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    await saveSettings(next);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
