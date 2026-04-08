/**
 * useQuoteSync.ts
 * Sincroniza el quoteStore de Zustand con Supabase.
 *
 * - Al montar: carga el historial real desde Supabase → reemplaza el seed
 * - Cuando se guarda/elimina favorito: persiste el cambio en Supabase
 * - Cuando se genera la frase del día: la guarda en Supabase
 *
 * Zustand sigue siendo la fuente de verdad para la UI.
 * Supabase es el backend de persistencia.
 */

import { useEffect, useRef } from 'react';
import { useQuoteStore } from '@/store/quoteStore';
import {
  fetchQuoteHistory,
  fetchTodayQuote,
  saveQuote,
  toggleFavorite,
} from '@/services/quotesService';
import { useOnboardingStore } from '@/store/onboardingStore';

export function useQuoteSync() {
  const {
    todayQuote,
    history,
    setTodayQuote,
    toggleSave: zustandToggle,
  } = useQuoteStore();

  const { tonePreferences } = useOnboardingStore();

  // Track del último estado de favoritos para detectar cambios
  const prevFavoritesRef = useRef<Record<string, boolean>>({});

  // ── 1. Al montar: cargar historial desde Supabase ────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadFromSupabase() {
      try {
        // Frase de hoy
        const remoteToday = await fetchTodayQuote();
        if (!cancelled && remoteToday) {
          setTodayQuote(remoteToday);
        }

        // Historial completo
        const remoteHistory = await fetchQuoteHistory(60);
        if (!cancelled && remoteHistory.length > 0) {
          // Reemplazar el seed con datos reales de Supabase
          useQuoteStore.setState({
            history:         remoteHistory,
            isHistorySeeded: true,
          });

          // Snapshot inicial de favoritos
          const snapshot: Record<string, boolean> = {};
          remoteHistory.forEach((q) => { snapshot[q.id] = q.isFavorite; });
          prevFavoritesRef.current = snapshot;
        }
      } catch {
        // Sin conexión: queda el estado local/seed, no pasa nada
      }
    }

    loadFromSupabase();
    return () => { cancelled = true; };
  }, []);

  // ── 2. Guardar la frase del día cuando aparece por primera vez ───────────
  useEffect(() => {
    if (!todayQuote) return;

    saveQuote({ quote: todayQuote, tonePreferences }).catch(() => {
      // Fallo silencioso — la frase existe en local igualmente
    });
  }, [todayQuote?.id]);

  // ── 3. Detectar cambios de favorito → persistir en Supabase ─────────────
  useEffect(() => {
    const prev = prevFavoritesRef.current;

    history.forEach((q) => {
      const wasLiked = prev[q.id];
      const isLiked  = q.isFavorite;

      if (wasLiked !== undefined && wasLiked !== isLiked) {
        // Cambio detectado → sincronizar
        toggleFavorite(q.id, isLiked).catch(() => {});
      }
    });

    // Actualizar snapshot
    const snapshot: Record<string, boolean> = {};
    history.forEach((q) => { snapshot[q.id] = q.isFavorite; });
    prevFavoritesRef.current = snapshot;
  }, [history]);
}
