import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Persiste la preferencia de tema en AsyncStorage para que sobreviva
// cierres de app y recargas de Metro.

interface SettingsState {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isDark: true,
      setIsDark: (value) => set({ isDark: value }),
    }),
    {
      name: 'enea-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
