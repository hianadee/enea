/**
 * useDeepLink.ts
 * Escucha el deep link del magic link de Supabase y completa la sesión.
 *
 * Cuando el usuario pulsa el enlace del email, la app se abre con:
 *   enea://auth/callback#access_token=...&refresh_token=...
 *
 * Supabase lo procesa automáticamente vía onAuthStateChange,
 * pero necesitamos pasar la URL al cliente para que la parsee.
 *
 * Seguridad:
 *  - Solo el scheme 'enea://' está permitido
 *  - Solo la ruta exacta '/auth/callback' es procesada
 *  - Cualquier otra URL se descarta silenciosamente
 */

import { useEffect } from 'react';
import { Linking } from 'react-native';
import { supabase } from '@/lib/supabase';

// Única ruta de deep link que dispara lógica de autenticación.
// Cualquier otra ruta (enea://anything-else) se ignora.
const ALLOWED_AUTH_PATH = 'auth/callback';

export function useDeepLink() {
  useEffect(() => {
    // 1. App ya abierta → escuchar links entrantes
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    // 2. App cerrada → recuperar el link que la abrió
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    return () => subscription.remove();
  }, []);
}

function handleUrl(url: string) {
  // Verificar scheme
  if (!url.startsWith('enea://')) return;

  // Verificar ruta — extraer la parte entre 'enea://' y el primer '#' o '?'
  const withoutScheme = url.slice('enea://'.length);           // 'auth/callback#...'
  const path = withoutScheme.split(/[#?]/)[0].replace(/\/$/, ''); // 'auth/callback'

  if (path !== ALLOWED_AUTH_PATH) return;

  // Supabase espera la URL completa para extraer tokens del hash
  supabase.auth.getSession(); // refresca la sesión si los tokens están en el storage
}
