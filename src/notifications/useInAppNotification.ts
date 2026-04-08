/**
 * useInAppNotification.ts
 * Controla la visibilidad del banner in-app "¿Estás preparado/a para saber tu frase de hoy?".
 *
 * El banner se muestra cuando:
 *   1. La app vuelve a primer plano desde background/inactivo (AppState)
 *   2. El usuario toca la notificación push diaria (addNotificationResponseReceivedListener)
 *
 * Reglas:
 *   - Solo se muestra UNA VEZ por sesión de app (flag de módulo → se resetea al matar la app)
 *   - Solo si la notificación diaria está activada en el store
 *   - No-bloqueante: si algo falla, la app sigue funcionando
 */

import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNotificationStore } from '@/store/notificationStore';

// ─── Singleton de sesión ──────────────────────────────────────────────────────
// Se resetea cuando la app se mata y se reabre (proceso nuevo).
let _shownThisSession = false;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInAppNotification() {
  const [visible, setVisible]   = useState(false);
  const appStateRef             = useRef<AppStateStatus>(AppState.currentState);

  // ─── Show / dismiss ────────────────────────────────────────────────────────

  const show = () => {
    // Comprobar estado actual del store en el momento del evento (evita closures stale)
    const { dailyQuote } = useNotificationStore.getState();
    if (!dailyQuote.enabled) return;
    if (_shownThisSession)   return;

    _shownThisSession = true;
    setVisible(true);
  };

  const dismiss = () => setVisible(false);

  // ─── Listener: app vuelve a foreground ─────────────────────────────────────

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const wasBackground = appStateRef.current.match(/inactive|background/);
      const nowActive     = nextState === 'active';

      if (wasBackground && nowActive) {
        show();
      }
      appStateRef.current = nextState;
    });

    return () => sub.remove();
  }, []);

  // ─── Listener: usuario toca la notificación push ───────────────────────────

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const type = response.notification.request.content.data?.type;
      if (type !== 'daily-quote') return;

      // Al venir de una notificación, permitir mostrar aunque ya se hubiese visto
      // (el usuario explícitamente tocó el aviso, merece la bienvenida)
      _shownThisSession = false;
      show();
    });

    return () => sub.remove();
  }, []);

  return { visible, dismiss };
}
