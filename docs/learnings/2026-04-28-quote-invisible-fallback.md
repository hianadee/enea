# Frase del día invisible en TestFlight

**Fecha:** 2026-04-28
**Build afectado:** 10
**Estado:** Diagnosticado, pendiente fix

## Síntoma

En TestFlight, al abrir la pestaña **Hoy**:
- El usuario ve los anillos de fondo (`GeometryBackground`) y el logo
- **Ningún texto de frase, fecha, badge, ni notificación strip**
- En simulador: todo se renderiza correctamente

## Causa raíz

Bug de lógica en `DailyQuoteScreen.tsx` (introducido en commit `aba54d2 — v1.0 launch`). El `.then` del `useEffect` que carga la frase del día solo dispara la animación de reveal cuando llega una frase real, no cuando llega un placeholder:

```tsx
generateDailyQuote(...)
  .then((quote) => {
    setTodayQuote(quote);
    if (!quote.isPlaceholder) {       // ← gate
      animHeader.setValue(0);
      animQuote.setValue(0);
      animateIn();                    // solo corre si NO es placeholder
    }
  })
```

`animQuote` y `animHeader` empiezan en 0 (`useRef(new Animated.Value(0))`). El `revealStyle` interpola opacidad desde 0 → 1. Si `animateIn()` no corre, los elementos se quedan a opacidad 0 — invisibles aunque su contenido esté en el state.

## Cuándo se manifiesta

Solo si **TODOS** estos a la vez:
1. `todayQuote === null` al montar (no hay caché en memoria — `useQuoteStore` no persiste)
2. `generateDailyQuote()` cae al fallback y devuelve un placeholder
3. Por tanto `quote.isPlaceholder === true` → animateIn no corre

## Por qué no se vio en simulador

En simulador, la `Edge Function generate-quote` de Supabase responde correctamente:
- Mac con buena red → la llamada HTTP llega rápido
- La API de Anthropic responde sin timeout
- `quote.isPlaceholder === false` → animateIn corre → contenido visible

En TestFlight, la Edge Function probablemente está fallando con 401 (auth):
- La anon key del proyecto se migró a formato `sb_publishable_*` (publishable key, no JWT HS256)
- La Edge Function compara `bearer === SUPABASE_ANON_KEY` (env var del servidor)
- Si la env var del servidor sigue siendo el JWT viejo → no matches → 401
- El cliente cae al fallback → placeholder → bug se manifiesta

## Fix

### Inmediato (síntoma — la pantalla en blanco)

```tsx
.then((quote) => {
  setTodayQuote(quote);
  if (!isReady.current) {
    // Primera vez: revela aunque sea placeholder
    animateIn();
  } else if (!quote.isPlaceholder) {
    // Ya había placeholder visible, ahora llega real → reanima
    animHeader.setValue(0);
    animQuote.setValue(0);
    animateIn();
  }
})
```

Esto garantiza que el contenido es siempre visible, sea placeholder o no.

### Causa de fondo (Edge Function 401)

Verificar en Supabase Dashboard → Project Settings → API:
- Si la anon key visible es `sb_publishable_*`, asegurar que `SUPABASE_ANON_KEY` (env var de Edge Functions) está sincronizada con esa misma key
- O migrar la Edge Function a aceptar el formato publishable explícitamente

## Cómo prevenirlo

1. **Lógica de reveal/show no debe gatear por path-feliz vs path-triste.** Si una pantalla tiene un fallback, el fallback es un camino igual de válido y debe disparar la misma UI que el path principal.

2. **Test mínimo en RTL** que cubra ambos caminos:
   ```tsx
   it('reveals quote text when fallback returns placeholder', async () => {
     mockGenerateDailyQuote.mockResolvedValue({ ...placeholder, isPlaceholder: true });
     const { findByText } = render(<DailyQuoteScreen />);
     expect(await findByText(placeholder.text)).toBeVisible();
   });
   ```
   Este test hubiera detectado el bug en CI sin necesidad de TestFlight.

3. **Sentry breadcrumb cuando se dispara el fallback.** Si el fallback ocurre con frecuencia anormal en producción, es señal de que la Edge Function está rota — útil saberlo antes de que el usuario reporte.

4. **Preferir UI declarativa sin animaciones gateadas por estado de fetch.** O usar la animación con valor inicial 1 (ya visible) y solo animar transiciones, no la primera aparición.
