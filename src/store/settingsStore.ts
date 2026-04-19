import { create } from 'zustand';

// Nota: el estado de notificaciones vive en notificationStore (persiste en AsyncStorage).
// Este store solo gestiona preferencias UI de sesión: tema visual.

interface SettingsState {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isDark: true,
  setIsDark: (value) => set({ isDark: value }),
}));
