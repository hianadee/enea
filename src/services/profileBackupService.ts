/**
 * profileBackupService.ts
 * Backup local del perfil en AsyncStorage.
 *
 * Propósito: si upsertProfile() falla al final del onboarding
 * (sin red, Supabase caído), el payload queda guardado aquí.
 * useAppReady lo reintentará en el siguiente arranque.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfilePayload } from './profileService';

const BACKUP_KEY     = 'astro-enea-profile-backup';
const BACKUP_KEY_OLD = 'enea-profile-backup'; // migración v1→v2

/** Persiste el payload del perfil localmente */
export async function saveProfileBackup(payload: ProfilePayload): Promise<void> {
  await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify(payload));
}

/** Lee el backup, o null si no existe / está corrupto.
 *  Migra automáticamente desde la key anterior si es necesario. */
export async function loadProfileBackup(): Promise<ProfilePayload | null> {
  // Intentar key nueva primero
  let raw = await AsyncStorage.getItem(BACKUP_KEY);

  // Migración: si no hay key nueva, buscar en la antigua
  if (!raw) {
    raw = await AsyncStorage.getItem(BACKUP_KEY_OLD);
    if (raw) {
      // Migrar: guardar en nueva key y borrar la antigua
      try {
        await AsyncStorage.setItem(BACKUP_KEY, raw);
        await AsyncStorage.removeItem(BACKUP_KEY_OLD);
      } catch {}
    }
  }

  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProfilePayload;
  } catch {
    return null;
  }
}

/** Borra el backup una vez sincronizado con Supabase */
export async function clearProfileBackup(): Promise<void> {
  await AsyncStorage.removeItem(BACKUP_KEY);
}
