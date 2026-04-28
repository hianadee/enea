/**
 * useAuth.ts
 * Hook global de autenticación.
 * Gestiona el estado de sesión y expone helpers para toda la app.
 */

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  ensureSession,
  onAuthStateChange,
  isAnonymous,
} from '@/services/authService';

interface AuthState {
  user:        User | null;
  isLoading:   boolean;
  isAnonymous: boolean;
  isLinked:    boolean;   // tiene email vinculado
}

export function useAuth(): AuthState {
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Crear/recuperar sesión al montar
    ensureSession().then((u) => {
      setUser(u);
      setIsLoading(false);
    }).catch(() => {
      // Red no disponible o Supabase inalcanzable — continuar sin sesión
      setIsLoading(false);
    });

    // 2. Escuchar cambios de sesión (magic link, sign out, etc.)
    const unsubscribe = onAuthStateChange((session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    isLoading,
    isAnonymous:  isAnonymous(user),
    isLinked:     !!user?.email,
  };
}
