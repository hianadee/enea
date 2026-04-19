/**
 * NotificationScheduler.ts
 * Programación y cancelación de notificaciones locales diarias con expo-notifications.
 * Todas las notificaciones de Astro Enea se identifican con el prefijo ENEA_ID_PREFIX.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNEL_ID     = 'astro-enea-daily-quote';
const ENEA_ID_PREFIX = 'astro-enea-dq-';

// ─── Android Channel ──────────────────────────────────────────────────────────

/**
 * Configura el canal de notificación de Android (obligatorio en Android 8+).
 * Seguro de llamar múltiples veces — es idempotente.
 */
export async function setupAndroidChannel(): Promise<void> {
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name:              'Cita Diaria',
    importance:        Notifications.AndroidImportance.DEFAULT,
    vibrationPattern:  [0, 250, 250, 250],
    lightColor:        '#FC8181',
    sound:             'default',
    showBadge:         false,
  });
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

/**
 * Programa una notificación diaria repetida a la hora indicada.
 * Devuelve el identificador asignado por expo-notifications.
 */
export async function scheduleDailyQuote(hour: number, minute: number): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    identifier: `${ENEA_ID_PREFIX}${Date.now()}`,
    content: {
      title: 'Tu mensaje de hoy ✦',
      body:  'Tu frase diaria ya está lista.',
      sound: true,
      data:  { type: 'daily-quote' },
      ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
    },
    trigger: {
      type:   Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

/**
 * Cancela una notificación concreta por su ID.
 */
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * Cancela TODAS las notificaciones diarias de Astro Enea.
 * Útil antes de reprogramar o al desactivar la feature.
 */
export async function cancelAllDailyQuoteNotifications(): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const enea = all.filter((n) => n.identifier.startsWith(ENEA_ID_PREFIX));
  await Promise.all(enea.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

// ─── Query ────────────────────────────────────────────────────────────────────

/**
 * Devuelve las notificaciones de Astro Enea que siguen programadas en el sistema.
 */
export async function getScheduledDailyQuotes(): Promise<Notifications.NotificationRequest[]> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.filter((n) => n.identifier.startsWith(ENEA_ID_PREFIX));
}
