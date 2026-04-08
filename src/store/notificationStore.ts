/**
 * notificationStore.ts
 * Estado global persistente para la configuración de notificaciones push locales.
 * Persiste en AsyncStorage para sobrevivir reinicios de la app.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationConfig {
  enabled: boolean;
  hour: number;
  minute: number;
  /** ID devuelto por expo-notifications al programar; null si no está programada. */
  scheduledId: string | null;
}

interface NotificationState {
  dailyQuote: NotificationConfig;
  /**
   * null  → permisos aún no comprobados
   * true  → permisos concedidos
   * false → permisos denegados
   */
  permissionGranted: boolean | null;

  // ─── Actions ───────────────────────────────────────────────────────────────
  setPermissionGranted: (granted: boolean) => void;
  toggleDailyQuote: (enabled: boolean) => void;
  updateDailyQuoteTime: (hour: number, minute: number) => void;
  setScheduledId: (id: string | null) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      dailyQuote: {
        enabled:     true,
        hour:        8,
        minute:      0,
        scheduledId: null,
      },
      permissionGranted: null,

      setPermissionGranted: (granted) =>
        set({ permissionGranted: granted }),

      toggleDailyQuote: (enabled) =>
        set((s) => ({ dailyQuote: { ...s.dailyQuote, enabled } })),

      updateDailyQuoteTime: (hour, minute) =>
        set((s) => ({ dailyQuote: { ...s.dailyQuote, hour, minute } })),

      setScheduledId: (scheduledId) =>
        set((s) => ({ dailyQuote: { ...s.dailyQuote, scheduledId } })),
    }),
    {
      name:    'enea-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
