/**
 * AuthContext.tsx
 * Provee el estado de autenticación a toda la app.
 * Inicia la sesión anónima automáticamente al arrancar.
 */

import React, { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { useDeepLink } from '@/hooks/useDeepLink';

interface AuthContextValue {
  user:        User | null;
  isLoading:   boolean;
  isAnonymous: boolean;
  isLinked:    boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user:        null,
  isLoading:   true,
  isAnonymous: true,
  isLinked:    false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  useDeepLink(); // escucha magic links mientras la app está abierta
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
