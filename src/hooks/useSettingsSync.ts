/**
 * useSettingsSync.ts
 * Persiste los cambios de settingsStore en Supabase.
 *
 * - Al montar: carga los ajustes guardados desde el perfil de Supabase
 * - Cuando isDark o notificationsEnabled cambian: los guarda en Supabase
 */

import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { fetchProfile, updateSettings } from '@/services/profileService';

export function useSettingsSync() {
  const { isDark, notificationsEnabled, setIsDark, setNotificationsEnabled } =
    useSettingsStore();

  const mountedRef  = useRef(false);
  const prevDark    = useRef(isDark);
  const prevNotifs  = useRef(notificationsEnabled);

  // ── 1. Al montar: cargar ajustes desde Supabase ─────────────────────────
  useEffect(() => {
    fetchProfile()
      .then((profile) => {
        if (!profile) return;
        if (profile.is_dark               !== undefined) setIsDark(profile.is_dark!);
        if (profile.notifications_enabled !== undefined) setNotificationsEnabled(profile.notifications_enabled!);
      })
      .catch(() => {})
      .finally(() => { mountedRef.current = true; });
  }, []);

  // ── 2. Persistir cambios posteriores ────────────────────────────────────
  useEffect(() => {
    if (!mountedRef.current) return;           // ignorar carga inicial
    if (isDark === prevDark.current) return;   // sin cambio real

    prevDark.current = isDark;
    updateSettings({ is_dark: isDark }).catch(() => {});
  }, [isDark]);

  useEffect(() => {
    if (!mountedRef.current) return;
    if (notificationsEnabled === prevNotifs.current) return;

    prevNotifs.current = notificationsEnabled;
    updateSettings({ notifications_enabled: notificationsEnabled }).catch(() => {});
  }, [notificationsEnabled]);
}
