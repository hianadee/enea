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
import { fetchProfile, upsertProfile, ProfilePayload } from '../services/profileService';
import {
  loadProfileBackup,
  clearProfileBackup,
} from '../services/profileBackupService';
import { useOnboardingStore } from '../store/onboardingStore';
import { useUserStore } from '../store/userStore';
import { EnneagramType, NatalChart } from '../types';

/** Carga el perfil de Supabase en el onboardingStore para que
 *  generateDailyQuote tenga todos los datos necesarios al arrancar. */
function hydrateOnboardingStore(profile: ProfilePayload): void {
  const store = useOnboardingStore.getState();

  if (profile.first_name)   store.setFirstName(profile.first_name);
  if (profile.full_name)    store.setFullName(profile.full_name);

  if (profile.birth_date) {
    store.setBirthData({
      date:         profile.birth_date ?? undefined,
      time:         profile.birth_time ?? undefined,
      latitude:     profile.birth_latitude ?? undefined,
      longitude:    profile.birth_longitude ?? undefined,
      locationName: profile.birth_location_name ?? undefined,
    });
  }

  if (profile.natal_chart) {
    store.setNatalChart(profile.natal_chart as NatalChart);
  }

  if (profile.enneatype) {
    store.setEnneagramType(profile.enneatype as EnneagramType);
  }

  if (profile.tone_style || profile.tone_energy || profile.life_focus || profile.tone_tradition) {
    if (profile.tone_style)      store.setTonePreference('languageStyle',       profile.tone_style as any);
    if (profile.tone_energy)     store.setTonePreference('energy',              profile.tone_energy as any);
    if (profile.life_focus)      store.setTonePreference('lifeFocus',           profile.life_focus as any);
    if (profile.tone_tradition)  store.setTonePreference('spiritualTradition',  profile.tone_tradition as any);
  }

  if (profile.religion_response) store.setReligionResponse(profile.religion_response as any);
  if (profile.religion)          store.setReligion(profile.religion);

  store.setStep('complete');
}

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
      if (onboardingCompleted) {
        // Hidratar el store con el perfil de Supabase en background
        // para que generateDailyQuote tenga enneatype y natalChart
        ensureSession().then(() => fetchProfile()).then((profile) => {
          if (profile) hydrateOnboardingStore(profile);
        }).catch(() => {/* offline — el store queda vacío, usará placeholder */});

        if (!profileSynced) retryProfileSync();
      }
      setRoute(onboardingCompleted ? 'main' : 'onboarding');
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
            hydrateOnboardingStore(profile);
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
