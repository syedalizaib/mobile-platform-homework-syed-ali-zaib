import React, { createContext, useContext, useEffect } from 'react';
import { usePreferencesStore } from '../store/usePreferencesStore';

export const COLORS = {
  light: {
    background: '#fff',
    surface: '#f5f5f5',
    text: '#000',
    textSecondary: '#666',
    border: '#eee',
    primary: '#007AFF',
    chipBg: '#eee',
    chipActive: '#007AFF',
    logItem: '#f5f5f5',
    success: '#34C759',
    error: '#FF3B30',
  },
  dark: {
    background: '#121212',
    surface: '#1e1e1e',
    text: '#fff',
    textSecondary: '#b0b0b0',
    border: '#333',
    primary: '#0A84FF',
    chipBg: '#333',
    chipActive: '#0A84FF',
    logItem: '#2c2c2c',
    success: '#30D158',
    error: '#FF453A',
  },
} as const;

type Theme = keyof typeof COLORS;

const ThemeContext = createContext<Theme>('light');

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const darkMode = usePreferencesStore((s) => s.prefs.darkMode ?? false);
  const load = usePreferencesStore((s) => s.load);
  const theme: Theme = darkMode ? 'dark' : 'light';

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors() {
  const theme = useTheme();
  return COLORS[theme];
}
