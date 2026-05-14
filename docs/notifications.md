# Notificaciones en Astro Enea

Documento técnico del comportamiento de notificaciones (push del sistema + banner in-app) en iOS y Android.

## Conceptos base

### Push notification (notificación del sistema)
Notificación gestionada por el SO (iOS o Android). Aparece en bandeja del dispositivo. Llega aunque la app esté cerrada o el iPhone bloqueado.

En Astro Enea: programada localmente vía `expo-notifications`, una al día a la hora elegida por el usuario (chips: 07:00 / 09:00 / 14:00 / 18:00 / 21:00).

### In-app notification (banner dentro de la app)
La pinta la propia app, no el sistema. Solo se ve si el usuario tiene la app abierta. En Astro Enea es un banner suave: *"¿Estás preparado/a para saber tu frase de hoy?"*

Las dos coexisten porque cubren escenarios complementarios.

## Triggers del banner in-app

Tres eventos disparan `show()` en `useInAppNotification.ts`:

### 1. App vuelve a foreground desde background
`AppState.addEventListener('change', ...)` detecta la transición `inactive/background → active`. El usuario estaba en otra app y regresa a Astro Enea.

### 2. Usuario pulsa la notificación push del sistema
`Notifications.addNotificationResponseReceivedListener` se dispara cuando `data.type === 'daily-quote'`. Override de `_shownThisSession` para forzar el banner aunque ya se hubiera mostrado.

### 3. Llega la hora configurada con app ya abierta
Timer cada 30 segundos. Compara `now.getHours()` y `now.getMinutes()` contra `dailyQuote.hour/minute` del store. Si coincide y aún no se ha disparado hoy → muestra el banner.

Cubre el caso "el usuario está usando la app cuando llega su hora" — la push del sistema iOS no aparece con la app activa, así que sin este timer no llegaría aviso.

## Reglas de comportamiento

| Regla | Razón |
|---|---|
| Solo una vez por sesión (flag `_shownThisSession` a nivel de módulo) | Evitar molestar |
| Re-show permitido si viene de tap en push o de la hora exacta | El usuario lo está pidiendo explícitamente |
| Solo si `dailyQuote.enabled === true` en store | Respeto al toggle del usuario |
| Sesión = vida del proceso JS (se resetea al matar app) | Simple, predecible |
| No bloqueante: si algo falla, la app sigue funcionando | Notificación ≠ feature crítica |

## Diferencias iOS vs Android

### iOS

**Push en foreground:**
- Por defecto NO se muestra el banner del sistema cuando la app está activa
- Por eso es CRÍTICO el timer in-app para cubrir el caso "app abierta cuando llega la hora"

**Permisos:**
- Modal del sistema al primer arranque (o cuando se solicita)
- Si denegado: `permissionGranted: false` → banner "Activa los permisos" en pantalla Tú con CTA a Ajustes del sistema

**Background app refresh:**
- Necesario para que iOS dispare la notificación local programada
- Si el usuario lo desactiva, las locales no llegan — fuera de control de la app

**Sonido / vibración:**
- Configurable; Astro Enea usa por defecto sin sonido custom (respeta tono reflexivo)

### Android

**Push en foreground:**
- SÍ se muestra el banner del sistema por defecto
- Riesgo de solapamiento con el banner in-app si ambos disparan al mismo tiempo
- Mitigación: `_shownThisSession` evita que el in-app aparezca dos veces

**Permisos:**
- Android 13+ requiere `POST_NOTIFICATIONS` permission explícita
- Versiones anteriores eran automáticas
- Astro Enea solicita el permiso vía `requestPermissions()` en el momento adecuado

**Channels:**
- Cada notificación pertenece a un canal con prioridad/sonido/vibración propios
- Astro Enea define el canal `astro-enea-daily-quote` en `NotificationScheduler.ts` con `importance: DEFAULT`, vibración suave y luz `#FC8181` (acento de marca)
- El usuario puede ajustar cada canal individualmente desde Ajustes de Android

**Battery optimization:**
- Si el usuario tiene optimización agresiva, las locales pueden retrasarse o no llegar
- Fuera del control de la app — solo se puede sugerir al usuario que añada Astro Enea a excepciones

## Diseño visual del banner in-app

- Entrada animada deslizando desde arriba (no intrusiva)
- Texto: *"¿Estás preparado/a para saber tu frase de hoy?"*
- Tap en el banner → navega a la pestaña Hoy + cierra el banner
- Tap en X → solo cierra el banner, marca `_shownThisSession = true`
- Auto-dismiss tras N segundos de inactividad

## Flujos de usuario completos

### Escenario A: ritual matutino con push
1. **8:55** — usuario despierta, ve push de Astro Enea programada para 9:00 en lockscreen
2. **9:00** — push aparece (silenciosa o con sonido según preferencia)
3. Usuario lee, toca → app abre
4. Banner in-app NO se muestra (la navegación directa desde push ya cubre)
5. Usuario aterriza en pantalla Hoy con la frase del día

### Escenario B: comprobador casual
1. **11:00** — usuario abre Astro Enea por primera vez en el día (push programada era 9:00)
2. App detecta foreground transition desde "no había estado abierta hoy"
3. Banner in-app aparece con mensaje suave
4. Tap → navega a Hoy con la frase

### Escenario C: ya estaba en la app
1. **8:55** — usuario está en Astro Enea Diario escribiendo entradas
2. **9:00:00–9:00:30** — timer dispara `show()` porque hora coincide
3. Banner in-app baja desde arriba sin interrumpir lo que escriba
4. Usuario decide: lee la frase ahora o cierra el banner y sigue

### Escenario D: usuario pausó las notificaciones
1. Usuario en pantalla Tú · Avisos toca toggle off de "Cita diaria"
2. `dailyQuote.enabled = false` se guarda en AsyncStorage
3. La notificación local programada se cancela (`scheduledId` limpiado)
4. Ningún trigger del banner se dispara mientras esté pausada
5. Re-toggle on → reprograma + chips de hora reaparecen

## Tradeoffs de diseño

- **Polling cada 30s vs cada 1s:** con 30s el banner puede aparecer hasta 30 segundos tarde respecto a la hora exacta. 30x menos coste de batería. Aceptable porque la frase del día no requiere precisión de reloj.

- **Una vez por sesión:** evita molestar. Coste: si el usuario abre y cierra Astro Enea 5 veces en una hora ANTES de su hora programada, no ve el banner hasta el primer foreground DESPUÉS de la hora.

- **Banner vs modal:** banner permite seguir con lo que el usuario estaba haciendo. Un modal sería más intrusivo, menos respetuoso del tono *"frase reflexiva"*.

- **No persistencia de la flag entre sesiones:** si el usuario mata la app y la abre 5 minutos después, ve el banner otra vez. Mejora futura: guardar `lastShownDate` en AsyncStorage para limitar a "1 vez por día calendario".

## Lo que NO hace (intencionalmente)

- **Re-engagement push** ("te echamos de menos") — filosofía Astro Enea: respetuoso, no intrusivo
- **Badges en el icono de app** — los números rojos generan ansiedad, rompen el tono íntimo
- **Notificaciones por contenido** (frase favorita guardada, etc.) — una sola push diaria, máximo
- **Sonido custom invasivo** — si el usuario quiere sonido, usa el default del sistema
- **Cross-device sync** de notificaciones leídas — innecesario para v1.0

## Archivos relevantes

```
src/notifications/
├── useInAppNotification.ts   ← banner in-app: triggers + reglas
├── useNotifications.ts        ← hook de uso para componentes
├── NotificationService.ts     ← programación / cancelación de push locales
├── NotificationScheduler.ts   ← helpers de scheduling
└── NotificationPermissions.ts ← request/check de permisos

src/store/notificationStore.ts  ← estado persistente (enabled, hour, minute)

src/components/DailyQuoteBanner.tsx  ← UI del banner
```

## Métricas a monitorizar (futuro)

Para entender si el sistema funciona en la práctica:

- **% de pushes entregadas** vs programadas (Sentry / PostHog)
- **% de tap-through** en push diarias (¿cuánta gente abre la app desde la push?)
- **Tiempo medio entre dispatch del banner y tap** (¿se ignora? ¿se acepta?)
- **% de usuarios que desactivan la cita diaria en la primera semana** (señal de molestia)

Estas métricas no están instrumentadas en v1.0. Posible mejora post-lanzamiento.
