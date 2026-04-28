/**
 * useSubscription.ts
 * Expone el estado de suscripción/trial al resto de la app.
 *
 * En __DEV__ siempre retorna isBlocked=false para no interferir
 * con el desarrollo en Expo Go.
 */

import { useSubscriptionStore, getTrialStatus } from '@/store/subscriptionStore';

// Pon en false temporalmente para testear el PaywallScreen en dev
const BYPASS_PAYWALL = __DEV__;

export interface SubscriptionStatus {
  /** true cuando el trial ha caducado Y no hay suscripción activa */
  isBlocked:     boolean;
  isTrialActive: boolean;
  daysLeft:      number;
  isSubscribed:  boolean;
  hydrated:      boolean;
}

export function useSubscription(): SubscriptionStatus {
  const { trialStartDate, isSubscribed, hydrated, subscriptionVerified } = useSubscriptionStore();

  if (BYPASS_PAYWALL) {
    return {
      isBlocked:     false,
      isTrialActive: true,
      daysLeft:      BYPASS_PAYWALL ? 3 : 0,
      isSubscribed:  false,
      hydrated:      true,
    };
  }

  const { isTrialActive, daysLeft } = getTrialStatus(trialStartDate);

  // Hasta que RevenueCat haya respondido, NO bloqueamos. El cache local puede
  // decir "no suscrito" cuando el usuario sí lo está (típico tras reinstalar
  // desde TestFlight o tras compra reciente). Bloquear antes de la verificación
  // mete a usuarios suscritos en el paywall.
  const isBlocked = subscriptionVerified && !isTrialActive && !isSubscribed;

  return { isBlocked, isTrialActive, daysLeft, isSubscribed, hydrated };
}
