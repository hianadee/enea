/**
 * useOnboardingSave.ts
 * Orquesta el guardado del perfil en Supabase + envío del magic link.
 *
 * Llamar desde OnboardingCompleteScreen cuando el usuario introduce su email.
 */

import { useOnboardingStore } from '@/store/onboardingStore';
import { useSettingsStore } from '@/store/settingsStore';
import { buildProfilePayload, upsertProfile } from '@/services/profileService';
import {
  saveProfileBackup,
  clearProfileBackup,
} from '@/services/profileBackupService';
import { linkEmail, ensureSession } from '@/services/authService';

export function useOnboardingSave() {
  const onboarding = useOnboardingStore();
  const settings   = useSettingsStore();

  /**
   * 1. Asegura que hay sesión anónima activa
   * 2. Guarda el perfil completo en Supabase
   * 3. Envía el magic link al email para convertir la cuenta en real
   */
  const saveAndProceed = async (email: string): Promise<void> => {
    // 1. Sesión
    await ensureSession();

    // 2. Guardar perfil
    const payload = buildProfilePayload({
      firstName:            onboarding.firstName,
      fullName:             onboarding.fullName,
      birthData:            onboarding.birthData,
      natalChart:           onboarding.natalChart,
      numerologyProfile:    onboarding.numerologyProfile,
      enneagramType:        onboarding.enneagramType,
      religionResponse:     onboarding.religionResponse,
      religion:             onboarding.religion,
      tonePreferences:      onboarding.tonePreferences,
      notificationsEnabled: settings.notificationsEnabled,
      isDark:               settings.isDark,
    });

    await upsertProfile(payload);

    // 3. Magic link — convierte la cuenta anónima en real
    await linkEmail(email);
  };

  /**
   * Guarda el perfil sin vincular email (usuario pulsa "Ahora no").
   *
   * Estrategia de resiliencia:
   *   1. Persiste el payload en AsyncStorage PRIMERO (backup local)
   *   2. Intenta upsert en Supabase — lanza si falla
   *   3. El caller (handleBegin) captura el error y marca profileSynced:false
   *   4. useAppReady reintentará desde el backup en el siguiente arranque
   */
  const saveAnonymous = async (): Promise<void> => {
    await ensureSession();

    const payload = buildProfilePayload({
      firstName:            onboarding.firstName,
      fullName:             onboarding.fullName,
      birthData:            onboarding.birthData,
      natalChart:           onboarding.natalChart,
      numerologyProfile:    onboarding.numerologyProfile,
      enneagramType:        onboarding.enneagramType,
      religionResponse:     onboarding.religionResponse,
      religion:             onboarding.religion,
      tonePreferences:      onboarding.tonePreferences,
      notificationsEnabled: settings.notificationsEnabled,
      isDark:               settings.isDark,
    });

    // Backup local PRIMERO — sobrevive a fallos de red
    await saveProfileBackup(payload);

    // Supabase — lanza si falla (el caller trackea el resultado)
    await upsertProfile(payload);

    // Éxito: el backup ya no es necesario
    await clearProfileBackup();
  };

  return { saveAndProceed, saveAnonymous };
}
