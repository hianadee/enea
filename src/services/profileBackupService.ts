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

const BACKUP_KEY = 'enea-profile-backup';

/** Persiste el payload del perfil localmente */
export async function saveProfileBackup(payload: ProfilePayload): Promise<void> {
  await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify(payload));
}

/** Lee el backup, o null si no existe / está corrupto */
export async function loadProfileBackup(): Promise<ProfilePayload | null> {
  const raw = await AsyncStorage.getItem(BACKUP_KEY);
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
