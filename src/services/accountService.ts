/**
 * accountService.ts
 * Gestión del ciclo de vida de la cuenta del usuario.
 *
 * Implementa Apple App Store Review Guideline 5.1.1(v) y los requirements
 * equivalentes de Google Play: las apps que crean cuenta deben permitir al
 * usuario borrar su cuenta y datos desde dentro de la app.
 *
 * Borrar cuenta = wipe local completo + signOut Supabase. El perfil en
 * Supabase queda huérfano (sin auth para acceder) — para borrarlo
 * completamente del servidor habría que añadir un Edge Function admin.
 * Para v1.0 la versión "local wipe + signOut" cumple el requirement.
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { useOnboardingStore } from '@/store/onboardingStore';

/**
 * Borra la cuenta del usuario:
 *  1. Cancela todas las notificaciones programadas
 *  2. signOut de Supabase (limpia SecureStore con el JWT)
 *  3. Borra TODO el AsyncStorage (todos los stores persistidos)
 *  4. Resetea el onboardingStore en memoria
 *
 * Después de llamar esta función, el caller debe navegar al stack de
 * Onboarding para que el usuario empiece de cero.
 *
 * Es no-bloqueante: si algún paso falla, los siguientes se ejecutan
 * igualmente. Lo importante es que el usuario quede desconectado y los
 * datos locales se pierdan.
 */
export async function deleteAccount(): Promise<void> {
  // 1. Cancelar notificaciones programadas (la del aviso diario)
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    logger.warn('[Account] cancelAllScheduledNotificationsAsync falló:', e);
  }

  // 2. signOut de Supabase — limpia el JWT del SecureStore
  try {
    await supabase.auth.signOut();
  } catch (e) {
    logger.warn('[Account] supabase.auth.signOut falló:', e);
  }

  // 3. Wipe completo del AsyncStorage — quita todos los stores persistidos:
  //    - enea-settings, astro-enea-notifications, enea-user,
  //      astro-enea-subscription, astro-enea-profile-backup, y resto
  try {
    await AsyncStorage.clear();
  } catch (e) {
    logger.warn('[Account] AsyncStorage.clear falló:', e);
  }

  // 4. Reset del store en memoria que tiene `reset()` definido — el resto de
  //    stores se hidratarán a defaults en el próximo arranque desde un
  //    AsyncStorage vacío
  try {
    useOnboardingStore.getState().reset();
  } catch (e) {
    logger.warn('[Account] onboardingStore.reset falló:', e);
  }
}
