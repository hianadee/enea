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
  const { trialStartDate, isSubscribed, hydrated } = useSubscriptionStore();

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
  const isBlocked = !isTrialActive && !isSubscribed;

  return { isBlocked, isTrialActive, daysLeft, isSubscribed, hydrated };
}
