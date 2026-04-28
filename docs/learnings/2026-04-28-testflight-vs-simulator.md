# TestFlight ≠ Simulador (meta-patrón)

**Fecha:** 2026-04-28
**Contexto:** Tras 3 builds rotos en TestFlight con bugs que el simulador no mostraba

## El patrón

Los bugs que cumplen alguna de estas condiciones **no se ven en simulador**, solo en TestFlight (build Release sobre device físico):

- Tocan **animaciones** (`Animated.Value`, opacity, transform)
- Dependen de **native modules** con UI nativa (`@react-native-community/datetimepicker`, etc.)
- Tienen un **fallback de red** (Edge Function + placeholder local)
- Asumen un **timing concreto** del JS thread
- Se compilan distinto bajo Hermes Release (optimizaciones agresivas, batching diferente)

## Por qué pasa

| Variable | Simulador (dev) | TestFlight (Release) |
|---|---|---|
| CPU | Mac (rápido) | iPhone (más lento) |
| JS engine | Hermes con dev-mode (más overhead, menos optimización) | Hermes Release (inlining agresivo, timings ajustados) |
| Red | Tu wifi, baja latencia | Cellular, latencias variables |
| Native module updates | Llegan tarde, fuera de momentum | Llegan dentro del momentum y cancelan inercia |
| Promesas de red | Resuelven rápido (camino feliz) | Pueden caer al fallback (camino triste) |

El simulador sistemáticamente sobre-muestrea el camino feliz y oculta race conditions.

## Casos concretos en ENEA

- [Picker iOS rebota a hora anterior](2026-04-28-picker-ios-release.md) — builds 9 y 10
- [Frase invisible en Hoy](2026-04-28-quote-invisible-fallback.md) — build 10

## Workflow correcto

Antes de declarar un fix completo:

1. **`expo run:ios --device`** — instalar Release/Debug en iPhone físico (no simulador). Captura ya muchos bugs de timing.

2. **`eas build --profile preview --platform ios`** — build Release real, instalable internamente. 8-12 minutos. Es el equivalente a TestFlight sin el review de Apple. Imprescindible para validar fixes que tocan los puntos arriba.

3. **TestFlight** solo cuando preview build pase. No usar TestFlight como entorno de test — el ciclo de feedback (24-48h) es demasiado caro.

## Reglas operativas

- "Funciona en simulador" no es señal suficiente para mergear un fix de animación / native / fallback
- Si un fix anterior no aguantó TestFlight, el siguiente intento empieza de cero — no añadir capas defensivas sobre la teoría rota
- Los logs de TestFlight (Sentry) son la fuente de verdad cuando algo se rompe — leerlos antes de teorizar
