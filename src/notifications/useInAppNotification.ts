/**
 * useInAppNotification.ts
 * Controla la visibilidad del banner in-app "¿Estás preparado/a para saber tu frase de hoy?".
 *
 * El banner se muestra cuando:
 *   1. La app vuelve a primer plano desde background/inactivo (AppState)
 *   2. La notificación push diaria LLEGA con la app en foreground
 *      (addNotificationReceivedListener — antes faltaba este caso)
 *   3. El usuario toca la notificación push diaria desde bandeja/lockscreen
 *      (addNotificationResponseReceivedListener)
 *   4. La app está en primer plano y se cumple la hora configurada
 *      (timer local cada 30s — backup para los casos en que (2) no dispare)
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

  // ─── Listener: push llega con app en foreground ────────────────────────────
  // CRÍTICO: con shouldShowBanner=false en NotificationService.ts, el sistema
  // no muestra ningún banner cuando llega la push en foreground. Sin este
  // listener, el usuario no se enteraría hasta que el timer de 30s coincida
  // (y solo si la hora es exacta). Este listener cubre el caso al instante.

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const type = notification.request.content.data?.type;
      if (type !== 'daily-quote') return;

      // Reset de la flag para permitir mostrar aunque ya se hubiese visto
      // antes en esta sesión — la push diaria es el evento explícito del día
      _shownThisSession = false;
      show();
    });

    return () => sub.remove();
  }, []);

  // ─── Listener: usuario toca la notificación push desde bandeja/lockscreen ──

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

  // ─── Timer local: dispara el banner si la app está en foreground a la hora ─
  // Cubre el caso "el usuario está usando la app cuando llega la hora configurada"
  // — la push del sistema no se muestra con la app activa, así que sin este timer
  // el banner no aparecería hasta el siguiente foreground.

  useEffect(() => {
    let lastFiredDay: string | null = null; // clave por día para no repetir

    const check = () => {
      const { dailyQuote } = useNotificationStore.getState();
      if (!dailyQuote.enabled) return;

      const now = new Date();
      const today = now.toDateString();
      if (lastFiredDay === today) return;

      if (now.getHours() === dailyQuote.hour && now.getMinutes() === dailyQuote.minute) {
        lastFiredDay = today;
        // Llegó la hora estando el usuario delante: forzar el banner aunque ya
        // se hubiese mostrado en el foreground inicial de la sesión.
        _shownThisSession = false;
        show();
      }
    };

    check(); // primer chequeo inmediato (cubre el caso de abrir app justo en la hora)
    const id = setInterval(check, 30_000); // cada 30s — barato y suficiente
    return () => clearInterval(id);
  }, []);

  return { visible, dismiss };
}
