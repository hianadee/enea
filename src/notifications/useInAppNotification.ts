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

// ─── Guard por día (módulo singleton) ─────────────────────────────────────────
// Una sola fecha — si el banner ya se mostró HOY, no se vuelve a mostrar
// independientemente del trigger (AppState, push recibida, push tapped, timer).
// El único caso que bypasa el daily limit: usuario tocó la push explícitamente
// desde lockscreen/bandeja — la intención del usuario es ver el banner.
// Se resetea cuando la app se mata y se reabre (proceso nuevo).
let _lastShownDay: string | null = null;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInAppNotification() {
  const [visible, setVisible]   = useState(false);
  const appStateRef             = useRef<AppStateStatus>(AppState.currentState);

  // ─── Show / dismiss ────────────────────────────────────────────────────────

  const show = (bypassDailyLimit = false) => {
    // Comprobar estado actual del store en el momento del evento (evita closures stale)
    const { dailyQuote } = useNotificationStore.getState();
    if (!dailyQuote.enabled) return;

    const today = new Date().toDateString();
    if (!bypassDailyLimit && _lastShownDay === today) return;

    _lastShownDay = today;
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
  // Con shouldShowBanner=false en NotificationService.ts, el sistema no muestra
  // banner cuando llega la push en foreground. Este listener cubre ese caso.
  // El daily limit aplica — si el banner ya se mostró hoy, no se vuelve a
  // disparar (evita race con el timer de 30s en la misma minute window).

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const type = notification.request.content.data?.type;
      if (type !== 'daily-quote') return;
      show();
    });

    return () => sub.remove();
  }, []);

  // ─── Listener: usuario toca la notificación push desde bandeja/lockscreen ──
  // BYPASS del daily limit: el usuario tocó explícitamente la push desde fuera
  // de la app — su intención es ver el banner, incluso si ya lo había visto hoy.

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const type = response.notification.request.content.data?.type;
      if (type !== 'daily-quote') return;
      show(true); // bypass daily limit
    });

    return () => sub.remove();
  }, []);

  // ─── Timer local: dispara el banner si la app está en foreground a la hora ─
  // Backup del listener `received` — cubre casos donde la push del SO no se
  // entregó (permisos revocados, OS supression, etc.). El daily limit lo
  // protege de duplicar el banner con el listener received.

  useEffect(() => {
    const check = () => {
      const { dailyQuote } = useNotificationStore.getState();
      if (!dailyQuote.enabled) return;

      const now = new Date();
      if (now.getHours() === dailyQuote.hour && now.getMinutes() === dailyQuote.minute) {
        show();
      }
    };

    check(); // primer chequeo inmediato (cubre el caso de abrir app justo en la hora)
    const id = setInterval(check, 30_000); // cada 30s — barato y suficiente
    return () => clearInterval(id);
  }, []);

  return { visible, dismiss };
}
