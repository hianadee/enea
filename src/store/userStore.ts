import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'enea-user';

interface UserState {
  onboardingCompleted: boolean;
  /** true once AsyncStorage has been read */
  hydrated: boolean;
  /** true only on very first install (no key in AsyncStorage) */
  isFirstInstall: boolean;
  setOnboardingCompleted: (value: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  onboardingCompleted: false,
  hydrated: false,
  isFirstInstall: true,

  setOnboardingCompleted: (value) => {
    set({ onboardingCompleted: value });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ onboardingCompleted: value })).catch(() => {});
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        // Key exists — trust the stored value (even if false after a dev reset)
        const parsed = JSON.parse(raw);
        set({ onboardingCompleted: !!parsed.onboardingCompleted, isFirstInstall: false });
      }
      // raw === null → first install, keep defaults (onboardingCompleted: false, isFirstInstall: true)
    } catch {
      // Ignore — defaults to false
    } finally {
      set({ hydrated: true });
    }
  },
}));
