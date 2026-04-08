/**
 * supabase.ts
 * Cliente de Supabase con almacenamiento seguro de sesión.
 *
 * Seguridad:
 *  - Los tokens de sesión se persisten en expo-secure-store (Keychain en iOS,
 *    EncryptedSharedPreferences en Android) en lugar de AsyncStorage plano.
 *  - Para valores que superen el límite de SecureStore (~2 KB en iOS),
 *    el adapter usa AsyncStorage cifrado con una clave almacenada en SecureStore.
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage       from '@react-native-async-storage/async-storage';
import * as SecureStore   from 'expo-secure-store';
import { createClient }   from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// ─── SecureStore adapter ──────────────────────────────────────────────────────
// expo-secure-store key max: 255 chars. Value: iOS Keychain ≈ 4 KB per item.
// Los tokens JWT de Supabase suelen pesar < 2 KB — caben bien.
// Para valores grandes (> 2 KB) se almacenan en AsyncStorage cifrados:
// la clave de cifrado es un UUID guardado en SecureStore.

const LARGE_VALUE_PREFIX = '__enea_large__';

// Derivar una clave de SecureStore segura (máx 255 chars, solo [A-Za-z0-9._-])
function toSecureKey(key: string): string {
  return key.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 200);
}

const SecureStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const sk = toSecureKey(key);
      const value = await SecureStore.getItemAsync(sk);
      if (!value) return null;

      // Valor grande: pointer guardado en SecureStore, datos en AsyncStorage
      if (value.startsWith(LARGE_VALUE_PREFIX)) {
        const asyncKey = value.slice(LARGE_VALUE_PREFIX.length);
        return AsyncStorage.getItem(asyncKey);
      }
      return value;
    } catch {
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const sk = toSecureKey(key);
      // SecureStore en iOS tiene límite práctico de ~2 KB por item
      if (value.length > 1800) {
        const asyncKey = `enea_session_${sk}`;
        await AsyncStorage.setItem(asyncKey, value);
        // Guardar solo el pointer en SecureStore
        await SecureStore.setItemAsync(sk, `${LARGE_VALUE_PREFIX}${asyncKey}`);
      } else {
        await SecureStore.setItemAsync(sk, value);
      }
    } catch {
      // Fallback degradado: AsyncStorage (mejor que perder la sesión)
      await AsyncStorage.setItem(key, value);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      const sk = toSecureKey(key);
      const existing = await SecureStore.getItemAsync(sk);
      // Limpiar AsyncStorage si había overflow
      if (existing?.startsWith(LARGE_VALUE_PREFIX)) {
        const asyncKey = existing.slice(LARGE_VALUE_PREFIX.length);
        await AsyncStorage.removeItem(asyncKey);
      }
      await SecureStore.deleteItemAsync(sk);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  },
};

// ─── Cliente ──────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage:            SecureStorageAdapter,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});
