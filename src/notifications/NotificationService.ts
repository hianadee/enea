/**
 * NotificationService.ts
 * Lógica central del sistema de notificaciones:
 *  - Configura el handler de foreground
 *  - initNotifications(): llamar una vez al arrancar la app
 *  - setDailyQuoteEnabled(): activar / desactivar
 *  - updateDailyQuoteTime(): cambiar la hora
 *
 * No requiere servidor — todo es on-device con expo-notifications.
 */

import { logger } from '@/utils/logger';

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { checkPermissions, requestPermissions } from './NotificationPermissions';
import {
  setupAndroidChannel,
  scheduleDailyQuote,
  cancelNotification,
  cancelAllDailyQuoteNotifications,
  getScheduledDailyQuotes,
} from './NotificationScheduler';
import { useNotificationStore } from '@/store/notificationStore';

// ─── Foreground handler ───────────────────────────────────────────────────────
// Configura cómo se muestran las notificaciones cuando la app está en primer plano.
// Se ejecuta al importar el módulo — antes de que monte cualquier componente.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,   // legacy iOS
    shouldShowBanner: true,   // iOS 14+
    shouldShowList:   true,   // iOS 14+ Notification Center
    shouldPlaySound:  true,
    shouldSetBadge:   false,
  }),
});

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * Inicializa el sistema de notificaciones al arrancar la app.
 *
 * Flujo:
 *  1. Configura el canal Android
 *  2. Comprueba permisos (sin pedirlos aún)
 *  3. Si la notificación debería estar programada pero no lo está
 *     (ej. tras reinstalar la app), la reprograma automáticamente
 */
export async function initNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await setupAndroidChannel();
    }

    // Comprobar permisos actuales (sin diálogo)
    const granted = await checkPermissions();
    useNotificationStore.getState().setPermissionGranted(granted);

    if (!granted) return;

    const { dailyQuote } = useNotificationStore.getState();
    if (!dailyQuote.enabled) return;

    // Verificar si la notificación sigue en el sistema (puede perderse tras reinstalar)
    const scheduled = await getScheduledDailyQuotes();
    const isAlive = dailyQuote.scheduledId
      ? scheduled.some((n) => n.identifier === dailyQuote.scheduledId)
      : false;

    if (!isAlive) {
      // Limpiar cualquier rastro y reprogramar desde cero
      await cancelAllDailyQuoteNotifications();
      const newId = await scheduleDailyQuote(dailyQuote.hour, dailyQuote.minute);
      useNotificationStore.getState().setScheduledId(newId);
    }
  } catch (e) {
    logger.warn('[NotificationService] initNotifications:', e);
  }
}

// ─── Enable / Disable ─────────────────────────────────────────────────────────

/**
 * Activa o desactiva la notificación de cita diaria.
 *
 * Al activar:
 *  - Solicita permisos si es necesario
 *  - Si se conceden, programa la notificación
 *  - Si se deniegan, deja enabled=false sin romper la app
 *
 * Al desactivar:
 *  - Cancela la notificación programada
 *  - Limpia el scheduledId del store
 */
export async function setDailyQuoteEnabled(
  enabled: boolean,
  hour: number,
  minute: number,
): Promise<void> {
  const store = useNotificationStore.getState();

  try {
    if (!enabled) {
      // Cancelar y limpiar
      if (store.dailyQuote.scheduledId) {
        await cancelNotification(store.dailyQuote.scheduledId).catch(() => {});
      }
      await cancelAllDailyQuoteNotifications();
      store.toggleDailyQuote(false);
      store.setScheduledId(null);
      return;
    }

    // Activar: pedir permisos si no están concedidos
    const granted = await requestPermissions();
    store.setPermissionGranted(granted);

    if (!granted) {
      // Usuario rechazó → no activamos la notificación
      store.toggleDailyQuote(false);
      return;
    }

    // Cancelar cualquier notificación previa y programar la nueva
    await cancelAllDailyQuoteNotifications();
    const id = await scheduleDailyQuote(hour, minute);
    store.toggleDailyQuote(true);
    store.setScheduledId(id);
  } catch (e) {
    logger.warn('[NotificationService] setDailyQuoteEnabled:', e);
  }
}

// ─── Update time ──────────────────────────────────────────────────────────────

/**
 * Actualiza la hora de la notificación diaria.
 * Si está desactivada, solo guarda la nueva hora para la próxima activación.
 * Si está activada, reprograma inmediatamente a la nueva hora.
 */
export async function updateDailyQuoteTime(hour: number, minute: number): Promise<void> {
  const store = useNotificationStore.getState();

  try {
    // Siempre guardamos la hora aunque esté desactivada
    store.updateDailyQuoteTime(hour, minute);

    if (!store.dailyQuote.enabled) return;

    // Reprogramar a la nueva hora
    await cancelAllDailyQuoteNotifications();
    const id = await scheduleDailyQuote(hour, minute);
    store.setScheduledId(id);
  } catch (e) {
    logger.warn('[NotificationService] updateDailyQuoteTime:', e);
  }
}
