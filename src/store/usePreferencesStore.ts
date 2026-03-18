import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = '@mobile_platform_preferences';

interface PreferencesState {
  prefs: Record<string, boolean>;
  set: (key: string, value: boolean) => Promise<void>;
  load: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  prefs: { darkMode: false, notifications: true },
  set: async (key, value) => {
    const next = { ...get().prefs, [key]: value };
    set({ prefs: next });
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
  },
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      if (raw) {
        const prefs = JSON.parse(raw);
        set({ prefs });
      }
    } catch {
      // ignore
    }
  },
}));
