/**
 * useSettingsSync.ts
 * Persiste los cambios de settings en Supabase.
 *
 * - Al montar: carga los ajustes desde el perfil Supabase y los aplica
 * - Cuando cambian isDark o dailyQuote.enabled: los guarda en Supabase
 *
 * Fuente de verdad para notificaciones: notificationStore.dailyQuote.enabled
 * (persiste en AsyncStorage, lo escribe SettingsScreen via toggleNotification).
 * settingsStore.notificationsEnabled se elimina del flujo — era un espejo roto.
 */

import { useEffect, useRef } from 'react';
import { useSettingsStore }    from '@/store/settingsStore';
import { useNotificationStore } from '@/store/notificationStore';
import { fetchProfile, updateSettings } from '@/services/profileService';

export function useSettingsSync() {
  const { isDark, setIsDark } = useSettingsStore();
  const { dailyQuote, toggleDailyQuote } = useNotificationStore();

  const mountedRef   = useRef(false);
  const prevDark     = useRef(isDark);
  const prevNotifs   = useRef(dailyQuote.enabled);

  // ── 1. Al montar: cargar ajustes desde Supabase ─────────────────────────
  useEffect(() => {
    fetchProfile()
      .then((profile) => {
        if (!profile) return;
        // Tema
        if (profile.is_dark !== undefined) setIsDark(profile.is_dark!);
        // Notificaciones — actualizar la fuente de verdad real (AsyncStorage)
        if (profile.notifications_enabled !== undefined) {
          toggleDailyQuote(profile.notifications_enabled!);
        }
      })
      .catch(() => {})
      .finally(() => { mountedRef.current = true; });
  }, []);

  // ── 2. Persistir cambio de tema ──────────────────────────────────────────
  useEffect(() => {
    if (!mountedRef.current) return;
    if (isDark === prevDark.current) return;

    prevDark.current = isDark;
    updateSettings({ is_dark: isDark }).catch(() => {});
  }, [isDark]);

  // ── 3. Persistir cambio de notificaciones ────────────────────────────────
  useEffect(() => {
    if (!mountedRef.current) return;
    if (dailyQuote.enabled === prevNotifs.current) return;

    prevNotifs.current = dailyQuote.enabled;
    updateSettings({ notifications_enabled: dailyQuote.enabled }).catch(() => {});
  }, [dailyQuote.enabled]);
}
