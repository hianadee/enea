import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'enea-user';

interface UserState {
  onboardingCompleted: boolean;
  /** true = el perfil existe en Supabase; false = solo en backup local */
  profileSynced: boolean;
  /** true once AsyncStorage has been read */
  hydrated: boolean;
  /** true only on very first install (no key in AsyncStorage) */
  isFirstInstall: boolean;
  setOnboardingCompleted: (value: boolean) => void;
  setProfileSynced: (value: boolean) => void;
  hydrate: () => Promise<void>;
}

/** Persiste ambos flags juntos para evitar inconsistencias */
function persist(onboardingCompleted: boolean, profileSynced: boolean): void {
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ onboardingCompleted, profileSynced }),
  ).catch(() => {});
}

export const useUserStore = create<UserState>((set, get) => ({
  onboardingCompleted: false,
  profileSynced: false,
  hydrated: false,
  isFirstInstall: true,

  setOnboardingCompleted: (value) => {
    set({ onboardingCompleted: value });
    persist(value, get().profileSynced);
  },

  setProfileSynced: (value) => {
    set({ profileSynced: value });
    persist(get().onboardingCompleted, value);
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        set({
          onboardingCompleted: !!parsed.onboardingCompleted,
          profileSynced:       !!parsed.profileSynced,
          isFirstInstall:      false,
        });
      }
      // raw === null → primera instalación, mantener defaults
    } catch {
      // Ignorar — defaults a false
    } finally {
      set({ hydrated: true });
    }
  },
}));
