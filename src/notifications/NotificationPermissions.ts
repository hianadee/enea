/**
 * NotificationPermissions.ts
 * Gestión de permisos de notificación — solicitud, comprobación y apertura de ajustes.
 * Toda la lógica es no-bloqueante: si el usuario rechaza, la app sigue funcionando.
 */

import * as Notifications from 'expo-notifications';
import { Platform, Linking } from 'react-native';

// ─── Check ────────────────────────────────────────────────────────────────────

/**
 * Comprueba el estado actual de los permisos SIN mostrar ningún diálogo.
 * Devuelve true si están concedidos.
 */
export async function checkPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

// ─── Request ──────────────────────────────────────────────────────────────────

/**
 * Solicita permisos de notificación al usuario.
 * - En Android < API 33 los permisos se conceden automáticamente.
 * - En iOS muestra el diálogo nativo del sistema.
 * Devuelve true si el usuario concede permisos.
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    // Android < 13 (API 33) no requiere permiso explícito
    if (Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version < 33) {
      return true;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    // Si ya fue denegado, el sistema no mostrará el diálogo de nuevo —
    // el usuario debe ir a Ajustes manualmente.
    if (existing === 'denied') return false;

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge:  true,
        allowSound:  true,
      },
    });

    return status === 'granted';
  } catch {
    return false;
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

/**
 * Abre los ajustes del sistema para que el usuario active los permisos manualmente.
 */
export function openNotificationSettings(): void {
  Linking.openSettings();
}
