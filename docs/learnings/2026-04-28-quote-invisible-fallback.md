# Frase del día invisible en TestFlight

**Fecha:** 2026-04-28
**Build afectado:** 10
**Estado:** Resuelto el mismo día — 2 fixes complementarios desplegados

## Síntoma

En TestFlight, al abrir la pestaña **Hoy**:
- El usuario ve los anillos de fondo (`GeometryBackground`) y el logo
- **Ningún texto de frase, fecha, badge, ni notificación strip**
- En simulador: todo se renderiza correctamente

## Causa raíz (real, confirmada)

Eran **DOS bugs apilados** que solo se manifestaban juntos. Ninguno individual rompía la experiencia — la combinación sí.

### Bug A — gateway de Supabase rechaza la auth (servidor)

A las **13:00 del 28-04-2026**, Supabase auto-redesplegó la Edge Function `generate-quote` (no fue deploy manual nuestro). Ese redeploy reinstauró `verify_jwt = true` a nivel de gateway.

El cliente envía la **publishable key** (`sb_publishable_*`) como Authorization header. La publishable key NO es un JWT — es un token plano. El gateway de Supabase la rechaza con error explícito:

```
HTTP 401
{"code":"UNAUTHORIZED_INVALID_JWT_FORMAT","message":"Invalid JWT"}
```

La request **nunca llega al código de la función**. La función nunca tiene oportunidad de validar el bearer contra el `SUPABASE_ANON_KEY` env var.

**Timeline confirmada por logs de Invocations** (Last 24 hours):
| Hora | Status | Nota |
|---|---|---|
| 10:05 | 401 | Roto |
| 12:32 → 13:11 | **200** ✅ | Ventana funcionando |
| 13:53 → 15:16+ | 401 | **Roto sistemáticamente desde el redeploy de las 13:00** |

`execution_time_ms: 550` en los 401s nos confundió inicialmente — pensamos que el código se ejecutaba. Curl directo desmintió: el 401 es del gateway, los 550ms incluyen routing/logging del gateway, no ejecución de función.

### Bug B — animación gateada por path-feliz (cliente)

Bug de lógica en `DailyQuoteScreen.tsx` (introducido en commit `aba54d2`). El `.then` del useEffect que carga la frase del día solo disparaba la animación de reveal si la frase era real, no si era placeholder:

```tsx
.then((quote) => {
  setTodayQuote(quote);
  if (!quote.isPlaceholder) {       // ← gate
    animHeader.setValue(0);
    animQuote.setValue(0);
    animateIn();                    // solo corre si NO es placeholder
  }
})
```

`animQuote` y `animHeader` empiezan en 0. Si `animateIn()` no corre, los elementos quedan a opacidad 0 — invisibles aunque su contenido esté en el state.

### La conjunción de A + B

1. App arranca → `todayQuote = null`
2. `generateDailyQuote()` llama a Edge Function
3. **Bug A:** Edge Function devuelve 401 (gateway)
4. Cliente cae al `catch` → devuelve placeholder local con `isPlaceholder: true`
5. `setTodayQuote(placeholder)` ejecuta — el state SÍ tiene contenido
6. **Bug B:** la condición `!quote.isPlaceholder` es false → `animateIn()` no corre
7. → Pantalla en blanco aunque la frase placeholder está cargada en memoria

Sin Bug A, Bug B no se manifestaba (siempre llegaban frases reales).
Sin Bug B, Bug A se notaría menos (el placeholder sería visible y obvio).

## Por qué no se vio en simulador

- **Bug A no aparece en simulador**: las Edge Functions auto-redespliegan en el contexto del proyecto Supabase, no del cliente. En desarrollo local, el cliente conecta a la misma Edge Function pero las llamadas eran intermitentes; las pocas que se hicieron pudieron haber caído en una ventana donde el gateway no rechazaba aún. Además, en simulador rara vez se valida el camino de fallback completo.
- **Bug B no aparece en simulador**: porque el camino feliz (Edge Function 200) sí dispara `animateIn`. Solo se manifiesta cuando la Edge Function falla, lo cual es raro en dev.

Patrón general: **bugs que solo emergen al combinar caminos no-feliz**. El simulador casi siempre recorre caminos felices.

## Fix (lo que se desplegó)

### Cliente — defensa en profundidad para Bug B

[Commit `317585a`](.) en `DailyQuoteScreen.tsx`:

```tsx
.then((quote) => {
  setTodayQuote(quote);
  if (!isReady.current) {
    // Primera vez que llega contenido (real o placeholder) → revelar
    animateIn();
  } else if (!quote.isPlaceholder) {
    // Ya había placeholder visible y ahora llega real → reanimar
    animHeader.setValue(0);
    animQuote.setValue(0);
    animateIn();
  }
})
```

`isReady.current` es la bandera que indica si ya hubo un primer reveal. Garantiza que el contenido siempre se hace visible, sea placeholder o real.

### Servidor — fix real de Bug A

[Commit `4d6301f`](.) en `supabase/functions/generate-quote/index.ts`:

1. **Hardcodear publishable key** como bearer válido, independiente del env var auto-gestionado:
```ts
const PUBLISHABLE_KEY = 'sb_publishable_nVx5AR6aFjFZmIGCT6igJA_M9zFfs6J';
const isValidApiKey =
  apiKeyHeader === supabaseAnonKey ||
  bearer       === supabaseAnonKey ||
  apiKeyHeader === PUBLISHABLE_KEY ||
  bearer       === PUBLISHABLE_KEY;
```

2. **Redesplegar con `--no-verify-jwt`** para que el gateway no rechace tokens no-JWT antes de que la función pueda hacer su propio check:
```bash
supabase functions deploy generate-quote --no-verify-jwt --project-ref myghlqincyftpuntehkp
```

Las publishable keys están diseñadas para ser públicas — hardcodearlas es seguro. La función mantiene su propio check de auth contra `PUBLISHABLE_KEY`, así que un atacante sin la key sigue recibiendo 401.

### Validación

Curl directo a la Edge Function tras el deploy:

```bash
$ curl -X POST https://myghlqincyftpuntehkp.supabase.co/functions/v1/generate-quote \
  -H "Authorization: Bearer sb_publishable_nVx..." \
  -H "Content-Type: application/json" \
  -d '{...payload...}'

HTTP 200 | 8.23s
{
  "text": "Lo que ves en otros y deseas tanto a veces ya vive en ti...",
  "explanation": "El tipo 4 tiende a percibir en los demás...",
  "planetaryContext": "Luna en Piscis · tránsito día 5"
}
```

8.2s incluye la generación con Claude API. El 401 está resuelto.

## Cómo prevenirlo

### Específicas de este bug

1. **Lógica de reveal/show no debe gatear por path-feliz vs path-triste.** Si una pantalla tiene fallback, el fallback es un camino igual de válido y debe disparar la misma UI que el path principal.

2. **No depender de env vars auto-gestionadas para auth crítica.** `SUPABASE_ANON_KEY` puede mutar sin aviso (rotación, migraciones, redeploys). Hardcodear la publishable key del proyecto en el código del servidor — al ser pública por diseño — es más predecible que confiar en el auto-injection.

3. **Considerar `--no-verify-jwt` por defecto en Edge Functions que aceptan publishable keys.** El default `verify_jwt = true` rechaza cualquier token no-JWT antes de llegar al código. Si tu función está diseñada para hacer su propia auth (como esta), es contraproducente.

### Generales

4. **Test mínimo en RTL que cubra el camino-fallback** (`mockGenerateDailyQuote.mockResolvedValue({...placeholder, isPlaceholder: true})`). Hubiera detectado Bug B en CI sin necesidad de TestFlight.

5. **Sentry breadcrumb cuando se dispara el fallback.** Si el placeholder se devuelve con frecuencia anormal en producción, es señal temprana de que algo del servidor está roto — útil saberlo antes de que el usuario reporte.

6. **Métricas/alertas en Edge Function por status code.** Una alerta tipo "% de 401s en última hora > 50%" hubiera avisado del problema a las 13:05, no a las 15:16.

7. **Preferir UI declarativa sin animaciones gateadas por estado de fetch** — o usar valor inicial 1 (ya visible) y solo animar transiciones, no la primera aparición.

## Lecciones meta

- **Diagnóstico inicial fue parcial.** El primer post de este doc tenía hipótesis sobre 401 sin confirmarla. Solo después de:
  - ver Invocations (no Logs) con status codes,
  - ver el timeline 200→401→200→401 que apuntaba a un evento de las 13:00,
  - hacer curl directo y leer el `UNAUTHORIZED_INVALID_JWT_FORMAT`,
  
  se confirmó la causa real (gateway, no código).

- **El "X funciona en simulador, no en TestFlight" no siempre es un bug del cliente.** En este caso parte del problema estaba en el SERVIDOR. Mirar logs del servidor antes de teorizar sobre el cliente es la regla.

- **Una vez había evidencia (curl 401 con error message), el fix tomó <10 minutos.** Las 2 horas previas fueron buscando esa evidencia. El cuello de botella nunca es el fix — es el diagnóstico.
