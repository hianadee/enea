/**
 * profileService.ts
 * Lectura y escritura del perfil de usuario en Supabase.
 * Mapea directamente con onboardingStore + settingsStore.
 */

import { supabase } from '@/lib/supabase';
import {
  BirthData,
  EnneagramType,
  NatalChart,
  NumerologyProfile,
  TonePreferences,
  ReligionResponse,
} from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfilePayload {
  // Identidad
  first_name?:             string;
  full_name?:              string;
  language?:               string;

  // Nacimiento
  birth_date?:             string | null;   // 'YYYY-MM-DD'
  birth_time?:             string | null;   // 'HH:MM'
  birth_latitude?:         number | null;
  birth_longitude?:        number | null;
  birth_location_name?:    string | null;

  // Carta natal
  natal_sun?:              string | null;
  natal_moon?:             string | null;
  natal_rising?:           string | null;
  dominant_planet?:        string | null;
  natal_chart?:            object | null;   // NatalChart completo

  // Numerología
  numerology_life_path?:   number | null;
  numerology_personal_year?: number | null;

  // Eneagrama
  enneatype?:              number | null;

  // Religión
  religion_response?:      string | null;
  religion?:               string | null;

  // Tono
  tone_tradition?:         string | null;
  tone_style?:             string | null;
  tone_energy?:            string | null;
  life_focus?:             string | null;

  // Ajustes
  notifications_enabled?:  boolean;
  is_dark?:                boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Construye el payload de perfil a partir de los stores */
export function buildProfilePayload(params: {
  firstName:         string;
  fullName:          string;
  birthData:         Partial<BirthData>;
  natalChart:        NatalChart | null;
  numerologyProfile: NumerologyProfile | null;
  enneagramType:     EnneagramType | null;
  religionResponse:  ReligionResponse | null;
  religion:          string | null;
  tonePreferences:   Partial<TonePreferences>;
  notificationsEnabled: boolean;
  isDark:            boolean;
}): ProfilePayload {
  return {
    first_name:              params.firstName,
    full_name:               params.fullName,
    language:                'es',

    birth_date:              params.birthData.date   ?? null,
    birth_time:              params.birthData.time   ?? null,
    birth_latitude:          params.birthData.latitude  ?? null,
    birth_longitude:         params.birthData.longitude ?? null,
    birth_location_name:     params.birthData.locationName ?? null,

    natal_sun:               params.natalChart?.sunSign    ?? null,
    natal_moon:              params.natalChart?.moonSign   ?? null,
    natal_rising:            params.natalChart?.risingSign ?? null,
    dominant_planet:         params.natalChart?.dominantPlanet ?? null,
    natal_chart:             params.natalChart ?? null,

    numerology_life_path:    params.numerologyProfile?.lifePath    ?? null,
    numerology_personal_year: params.numerologyProfile?.personalYear ?? null,

    enneatype:               params.enneagramType ?? null,

    religion_response:       params.religionResponse ?? null,
    religion:                params.religion ?? null,

    tone_tradition:          params.tonePreferences.spiritualTradition ?? null,
    tone_style:              params.tonePreferences.languageStyle       ?? null,
    tone_energy:             params.tonePreferences.energy              ?? null,
    life_focus:              params.tonePreferences.lifeFocus           ?? null,

    notifications_enabled:   params.notificationsEnabled,
    is_dark:                 params.isDark,
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/** Crea o actualiza el perfil (upsert) del usuario autenticado */
export async function upsertProfile(payload: ProfilePayload): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const { error } = await supabase
    .from('user_profiles')
    .upsert({ id: user.id, ...payload }, { onConflict: 'id' });

  if (error) throw error;
}

/** Lee el perfil del usuario autenticado */
export async function fetchProfile(): Promise<ProfilePayload | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // fila no encontrada
    throw error;
  }

  return data as ProfilePayload;
}

/** Actualiza solo los ajustes (notificaciones / tema) */
export async function updateSettings(params: {
  notifications_enabled?: boolean;
  is_dark?: boolean;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const { error } = await supabase
    .from('user_profiles')
    .update(params)
    .eq('id', user.id);

  if (error) throw error;
}
