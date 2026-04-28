/**
 * subscriptionStore.ts
 * Gestiona el estado del trial de 3 días y la suscripción del usuario.
 * Persiste manualmente en AsyncStorage (mismo patrón que userStore).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// ─── Constantes ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'astro-enea-subscription';
export const TRIAL_DAYS = 3;

export const PRODUCT_IDS = {
  monthly: 'astro_enea_monthly_099',
  annual:  'astro_enea_annual_999',
} as const;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS] | 'restored';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubscriptionState {
  /** ISO string del momento en que completó el onboarding — inicio del trial */
  trialStartDate: string | null;
  /** true si tiene suscripción activa (verificado con RevenueCat) */
  isSubscribed:   boolean;
  /** ID del producto activo */
  productId:      ProductId | null;
  /** true una vez que AsyncStorage ha sido leído */
  hydrated:       boolean;

  startTrial:    () => void;
  setSubscribed: (productId: ProductId) => void;
  setUnsubscribed: () => void;
  hydrate:       () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function persist(data: {
  trialStartDate: string | null;
  isSubscribed:   boolean;
  productId:      ProductId | null;
}): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  trialStartDate: null,
  isSubscribed:   false,
  productId:      null,
  hydrated:       false,

  startTrial: () => {
    if (get().trialStartDate) return; // ya iniciado — no reiniciar
    const date = new Date().toISOString();
    set({ trialStartDate: date });
    persist({ trialStartDate: date, isSubscribed: false, productId: null });
  },

  setSubscribed: (productId) => {
    set({ isSubscribed: true, productId });
    persist({ trialStartDate: get().trialStartDate, isSubscribed: true, productId });
  },

  setUnsubscribed: () => {
    set({ isSubscribed: false, productId: null });
    persist({ trialStartDate: get().trialStartDate, isSubscribed: false, productId: null });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          trialStartDate?: string;
          isSubscribed?:   boolean;
          productId?:      ProductId;
        };
        set({
          trialStartDate: parsed.trialStartDate ?? null,
          isSubscribed:   !!parsed.isSubscribed,
          productId:      parsed.productId ?? null,
        });
      }
    } catch {
      // Fallback: defaults
    } finally {
      set({ hydrated: true });
    }
  },
}));

// ─── Pure selector ────────────────────────────────────────────────────────────

export interface TrialStatus {
  isTrialActive: boolean;
  daysLeft:      number;
}

export function getTrialStatus(trialStartDate: string | null): TrialStatus {
  if (!trialStartDate) return { isTrialActive: false, daysLeft: 0 };

  const start    = new Date(trialStartDate).getTime();
  const now      = Date.now();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, TRIAL_DAYS - diffDays);

  return { isTrialActive: daysLeft > 0, daysLeft };
}
