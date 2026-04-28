/**
 * revenueCatService.ts
 * Wrapper sobre react-native-purchases (RevenueCat).
 *
 * IMPORTANTE:
 * - react-native-purchases requiere código nativo → NO funciona en Expo Go.
 * - En __DEV__ todas las funciones son noops / retornan mocks.
 * - En EAS build (development / production) funciona con las claves reales.
 *
 * Claves necesarias en .env:
 *   EXPO_PUBLIC_REVENUECAT_IOS_KEY
 *   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
 */

import { Platform } from 'react-native';
import { useSubscriptionStore, ProductId, PRODUCT_IDS } from '@/store/subscriptionStore';

// ─── Types mock (compatibles con react-native-purchases) ──────────────────────

export interface RCPackage {
  identifier:  string;
  product: {
    identifier:   string;
    priceString:  string;
    price:        number;   // valor numérico del precio
    currencyCode: string;   // ISO 4217: 'EUR', 'USD', etc.
    title:        string;
  };
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function initRevenueCat(userId?: string): Promise<void> {
  if (__DEV__) return; // Expo Go — skip

  try {
    const Purchases = require('react-native-purchases').default;
    const apiKey = Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? ''
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

    // NOTA: setLogLevel eliminado — Purchases.LOG_LEVEL puede ser undefined en v10
    // y crashea silenciosamente antes de que configure() se ejecute.
    Purchases.configure({ apiKey, appUserID: userId });
  } catch (e) {
    console.warn('[RevenueCat] No disponible:', e);
  }
}

// ─── Offerings ────────────────────────────────────────────────────────────────

/** Retorna los paquetes disponibles del offering actual.
 *  En __DEV__ devuelve datos hardcoded para diseñar la UI. */
export async function getOfferings(): Promise<RCPackage[]> {
  if (__DEV__) {
    return [
      {
        identifier: '$rc_monthly',
        product: {
          identifier:   PRODUCT_IDS.monthly,
          priceString:  '0,99 €',
          price:        0.99,
          currencyCode: 'EUR',
          title:        'Mensual',
        },
      },
      {
        identifier: '$rc_annual',
        product: {
          identifier:   PRODUCT_IDS.annual,
          priceString:  '8,99 €',
          price:        8.99,
          currencyCode: 'EUR',
          title:        'Anual',
        },
      },
    ];
  }

  const Purchases = require('react-native-purchases').default;
  let offerings: any;
  try {
    offerings = await Purchases.getOfferings();
  } catch (e: any) {
    throw new Error(`getOfferings() lanzó excepción: ${String(e?.message ?? e)}`);
  }

  // Diagnóstico RAW — mostrar todo lo que devuelve RC
  const allKeys   = Object.keys(offerings?.all ?? {});
  const currentId = offerings?.current?.identifier ?? 'NULL';
  const pkgCount  = offerings?.current?.availablePackages?.length ?? 0;
  const pkgIds    = (offerings?.current?.availablePackages ?? [])
    .map((p: any) => p?.product?.identifier ?? p?.identifier)
    .join(', ');

  if (!offerings?.current || pkgCount === 0) {
    throw new Error(
      `current: ${currentId} | all: [${allKeys.join(', ') || 'ninguno'}] | pkgs: ${pkgCount} | ids: [${pkgIds || 'ninguno'}]`,
    );
  }

  return offerings.current.availablePackages;
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

/** Ejecuta la compra de un paquete. Devuelve true si tuvo éxito. */
export async function purchasePackage(pkg: RCPackage): Promise<boolean> {
  if (__DEV__) {
    // En modo dev simular compra exitosa para testear el flujo
    useSubscriptionStore.getState().setSubscribed(pkg.product.identifier as ProductId);
    return true;
  }

  try {
    const Purchases = require('react-native-purchases').default;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isActive = Object.keys(customerInfo.entitlements.active).length > 0;
    if (isActive) {
      useSubscriptionStore.getState().setSubscribed(pkg.product.identifier as ProductId);
    }
    return isActive;
  } catch (e: any) {
    if (e?.userCancelled) return false; // el usuario canceló — no es un error real
    throw e;
  }
}

// ─── Restore ──────────────────────────────────────────────────────────────────

export async function restorePurchases(): Promise<boolean> {
  if (__DEV__) return false;

  try {
    const Purchases = require('react-native-purchases').default;
    const customerInfo = await Purchases.restorePurchases();
    const isActive = Object.keys(customerInfo.entitlements.active).length > 0;
    if (isActive) {
      useSubscriptionStore.getState().setSubscribed('restored');
    }
    return isActive;
  } catch {
    return false;
  }
}

// ─── Check status ─────────────────────────────────────────────────────────────

/** Verifica el estado actual de la suscripción con RevenueCat. */
export async function syncSubscriptionStatus(): Promise<void> {
  if (__DEV__) return;

  try {
    const Purchases = require('react-native-purchases').default;
    const customerInfo = await Purchases.getCustomerInfo();
    const isActive = Object.keys(customerInfo.entitlements.active).length > 0;
    if (isActive) {
      useSubscriptionStore.getState().setSubscribed('restored');
    } else {
      useSubscriptionStore.getState().setUnsubscribed();
    }
  } catch {
    // No hacer nada — el estado local es la fuente de verdad offline
  }
}
