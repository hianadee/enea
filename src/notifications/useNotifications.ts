/**
 * useNotifications.ts
 * Hook React para gestionar notificaciones push locales en componentes.
 *
 * Uso:
 *   const { dailyQuote, permissionGranted, toggle, updateTime, openSettings } = useNotifications();
 *
 * La inicialización (initNotifications) se ejecuta UNA SOLA VEZ por sesión de app,
 * independientemente de cuántas veces se monte el hook.
 */

import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { openNotificationSettings, requestPermissions } from './NotificationPermissions';
import {
  initNotifications,
  setDailyQuoteEnabled,
  updateDailyQuoteTime,
} from './NotificationService';

// Flag de módulo: garantiza que initNotifications se llama solo una vez por sesión
let _initialized = false;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const {
    dailyQuote,
    permissionGranted,
    setPermissionGranted,
  } = useNotificationStore();

  // Inicialización única al montar el primer consumidor del hook
  useEffect(() => {
    if (_initialized) return;
    _initialized = true;
    initNotifications();
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  /**
   * Activa o desactiva la notificación de cita diaria.
   * Solicita permisos si aún no han sido concedidos.
   */
  const toggle = async (enabled: boolean): Promise<void> => {
    await setDailyQuoteEnabled(enabled, dailyQuote.hour, dailyQuote.minute);
  };

  /**
   * Actualiza la hora del recordatorio diario.
   * Si está activa, reprograma al instante. Si no, guarda para la próxima activación.
   */
  const updateTime = async (hour: number, minute: number): Promise<void> => {
    await updateDailyQuoteTime(hour, minute);
  };

  /**
   * Solicita permisos explícitamente (para el botón "Activar" del banner).
   * Si se conceden y la notificación estaba activa, la reprograma.
   */
  const askPermission = async (): Promise<void> => {
    const granted = await requestPermissions();
    setPermissionGranted(granted);
    if (granted && dailyQuote.enabled) {
      await setDailyQuoteEnabled(true, dailyQuote.hour, dailyQuote.minute);
    }
  };

  return {
    /** Configuración actual: enabled, hour, minute, scheduledId */
    dailyQuote,
    /** null=no comprobado | true=concedido | false=denegado */
    permissionGranted,
    /** Activa / desactiva la notificación */
    toggle,
    /** Cambia la hora del recordatorio */
    updateTime,
    /** Solicita permisos desde el banner */
    askPermission,
    /** Abre Ajustes del sistema para activar permisos manualmente */
    openSettings: openNotificationSettings,
  };
}
