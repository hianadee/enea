import { create } from 'zustand';

interface SettingsState {
  isDark: boolean;
  notificationsEnabled: boolean;
  setIsDark: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isDark: true,
  notificationsEnabled: true,
  setIsDark: (value) => set({ isDark: value }),
  setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
}));
