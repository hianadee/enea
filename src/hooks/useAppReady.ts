/**
 * useAppReady.ts
 * Determina la pantalla inicial al arrancar la app.
 *
 * Lógica:
 *  1. Hidrata el flag onboardingCompleted desde AsyncStorage
 *  2. Si ya completó onboarding → ir directo a Main
 *     2a. Si profileSynced es false → reintenta sync en background desde backup
 *  3. Si no, intenta sesión + perfil en Supabase
 *  4. Fallback offline → comprobar Zustand local
 */

import { useEffect, useState } from 'react';
import { ensureSession } from '../services/authService';
import { fetchProfile, upsertProfile } from '../services/profileService';
import {
  loadProfileBackup,
  clearProfileBackup,
} from '../services/profileBackupService';
import { useOnboardingStore } from '../store/onboardingStore';
import { useUserStore } from '../store/userStore';

type AppRoute = 'loading' | 'onboarding' | 'main';

/** Reintenta sincronizar el perfil con Supabase desde el backup local.
 *  Fire-and-forget: no bloquea la navegación. */
async function retryProfileSync(): Promise<void> {
  try {
    const backup = await loadProfileBackup();
    if (!backup) return;

    const user = await ensureSession();
    if (!user) return;

    await upsertProfile(backup);
    await clearProfileBackup();
    useUserStore.getState().setProfileSynced(true);
  } catch {
    // Silencioso — se reintentará en el próximo arranque
  }
}

export function useAppReady(): AppRoute {
  const [route, setRoute] = useState<AppRoute>('loading');
  const localStep = useOnboardingStore((s) => s.step);
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const profileSynced       = useUserStore((s) => s.profileSynced);
  const hydrated            = useUserStore((s) => s.hydrated);
  const isFirstInstall      = useUserStore((s) => s.isFirstInstall);

  // Kick off hydration once
  useEffect(() => {
    useUserStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    // AsyncStorage tenía un valor explícito — confiar directamente
    if (!isFirstInstall) {
      setRoute(onboardingCompleted ? 'main' : 'onboarding');

      // Si el perfil no está en Supabase, reintentar en background
      if (onboardingCompleted && !profileSynced) {
        retryProfileSync();
      }
      return;
    }

    // Primera instalación: sin valor guardado → verificar Supabase
    let cancelled = false;

    async function check() {
      try {
        const user = await ensureSession();

        if (!user) {
          if (!cancelled) setRoute('onboarding');
          return;
        }

        const profile = await fetchProfile();

        if (!cancelled) {
          if (profile?.enneatype) {
            useUserStore.getState().setOnboardingCompleted(true);
            useUserStore.getState().setProfileSynced(true);
            setRoute('main');
          } else {
            setRoute('onboarding');
          }
        }
      } catch {
        if (!cancelled) {
          setRoute(localStep === 'complete' ? 'main' : 'onboarding');
        }
      }
    }

    check();
    return () => { cancelled = true; };
  }, [hydrated, onboardingCompleted, isFirstInstall]);

  return route;
}
