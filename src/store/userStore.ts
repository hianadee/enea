import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'enea-user';

/**
 * Genera un ID único por dispositivo. Usado como clave de cache servidor-side.
 * No necesita ser criptográficamente seguro — solo razonablemente único entre
 * la base de usuarios. Formato: "cl-{timestamp36}-{random12}".
 */
function generateClientId(): string {
  const ts   = Date.now().toString(36);
  const rand = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('');
  return `cl-${ts}-${rand}`;
}

interface UserState {
  onboardingCompleted: boolean;
  /** true = el perfil existe en Supabase; false = solo en backup local */
  profileSynced: boolean;
  /** UUID estable del dispositivo — clave de cache servidor-side */
  clientId: string | null;
  /** true once AsyncStorage has been read */
  hydrated: boolean;
  /** true only on very first install (no key in AsyncStorage) */
  isFirstInstall: boolean;
  setOnboardingCompleted: (value: boolean) => void;
  setProfileSynced: (value: boolean) => void;
  hydrate: () => Promise<void>;
}

interface PersistedShape {
  onboardingCompleted: boolean;
  profileSynced:       boolean;
  clientId:            string;
}

/** Persiste todos los campos juntos para evitar inconsistencias */
function persist(data: PersistedShape): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
}

export const useUserStore = create<UserState>((set, get) => ({
  onboardingCompleted: false,
  profileSynced:       false,
  clientId:            null,
  hydrated:            false,
  isFirstInstall:      true,

  setOnboardingCompleted: (value) => {
    set({ onboardingCompleted: value });
    const { profileSynced, clientId } = get();
    if (clientId) persist({ onboardingCompleted: value, profileSynced, clientId });
  },

  setProfileSynced: (value) => {
    set({ profileSynced: value });
    const { onboardingCompleted, clientId } = get();
    if (clientId) persist({ onboardingCompleted, profileSynced: value, clientId });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as Partial<PersistedShape>;
        // Caso: usuario pre-existente sin clientId (migración) → generar uno y persistir
        const clientId = parsed.clientId ?? generateClientId();
        const data: PersistedShape = {
          onboardingCompleted: !!parsed.onboardingCompleted,
          profileSynced:       !!parsed.profileSynced,
          clientId,
        };
        if (!parsed.clientId) persist(data); // backfill silencioso
        set({
          ...data,
          isFirstInstall: false,
        });
      } else {
        // Primera instalación: generar clientId y persistir
        const clientId = generateClientId();
        const data: PersistedShape = {
          onboardingCompleted: false,
          profileSynced:       false,
          clientId,
        };
        persist(data);
        set({ ...data });
      }
    } catch {
      // Ignorar — defaults a false / null
    } finally {
      set({ hydrated: true });
    }
  },
}));
