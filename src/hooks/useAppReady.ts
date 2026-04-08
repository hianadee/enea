/**
 * useAppReady.ts
 * Determina la pantalla inicial al arrancar la app.
 *
 * Lógica:
 *  1. Hidrata el flag onboardingCompleted desde AsyncStorage
 *  2. Si ya completó onboarding → ir directo a Main
 *  3. Si no, intenta sesión + perfil en Supabase
 *  4. Fallback offline → comprobar Zustand local
 */

import { useEffect, useState } from 'react';
import { ensureSession } from '../services/authService';
import { fetchProfile } from '../services/profileService';
import { useOnboardingStore } from '../store/onboardingStore';
import { useUserStore } from '../store/userStore';

type AppRoute = 'loading' | 'onboarding' | 'main';

export function useAppReady(): AppRoute {
  const [route, setRoute] = useState<AppRoute>('loading');
  const localStep = useOnboardingStore((s) => s.step);
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const hydrated = useUserStore((s) => s.hydrated);

  // Kick off hydration once
  useEffect(() => {
    useUserStore.getState().hydrate();
  }, []);

  const isFirstInstall = useUserStore((s) => s.isFirstInstall);

  useEffect(() => {
    if (!hydrated) return;

    // AsyncStorage had an explicit value — trust it directly
    if (!isFirstInstall) {
      setRoute(onboardingCompleted ? 'main' : 'onboarding');
      return;
    }

    // First install: no stored value → check Supabase to detect returning users
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
