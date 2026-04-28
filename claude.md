Create a CLAUDE.md file in the root of the project with this exact content:

# ENEA — Project Brief for Claude Code

## What is ENEA
ENEA is a personalized inspirational quotes app for iOS and Android.
Every quote is uniquely generated for each user based on:
- Their natal chart (calculated with Swiss Ephemeris / swisseph)
- Their Enneagram type (based on Claudio Naranjo's characterology)
- Their spiritual belief and tone preferences

Tagline: "Tu energía, tu verdad, hoy."
Brand voice: intimate, poetic, never generic. Spoken by Enea — the guide.

---

## Tech Stack
- React Native + Expo (managed workflow)
- TypeScript
- NativeWind (Tailwind for React Native)
- Zustand (state management)
- React Navigation (stack + bottom tabs)
- swisseph (Swiss Ephemeris for precise natal chart calculations)
- react-native-svg (natal chart wheel visualization)
- @react-native-community/datetimepicker (native iOS/Android pickers)
- Supabase (auth + database)
- Anthropic Claude API — modelo claude-sonnet-4-6 (generación de frases via Supabase Edge Function)

---

## Project Structure
- src/screens/onboarding/ — all onboarding screens
- src/screens/main/ — daily quote, journal, favorites, settings, weekly insight
- src/components/ — shared UI components
- src/constants/theme.ts — colors, typography, planet palettes
- src/constants/enneagram.ts — Naranjo's 9 enneatypes
- src/store/onboardingStore.ts — Zustand store
- src/navigation/ — navigators
- assets/ — icon, logo, images

---

## Design System
- Background: #000000 (pure black)
- Text: #FFFFFF primary, muted gray secondary
- Accent: planet-based colors (Moon violet #C4B5FD, Saturn navy, Venus rose...)
- Typography: serif for headings (editorial feel), sans-serif for body
- Touch targets: minimum 44x44pt (WCAG 2.1)
- Dark mode only

---

## Onboarding Flow (10 steps)
1. Intro/Splash — logo + "Nada de lo que sientes es accidental."
2. Nombre — "Hola, soy Enea. ¿Cómo te llamas?"
3. Fecha de nacimiento — native DateTimePicker iOS / custom scroll Android
4. Lugar de nacimiento — autocomplete with lat/lng
5. Hora de nacimiento — native TimePicker (optional)
6. Carta natal — SVG wheel calculated with swisseph
7. ¿Eres religioso/a? — Sí / No / Espiritual no religioso/a
8. Tradición espiritual — only if "Sí" in step 7
9. Eneagrama — Naranjo's 9 types, short test or direct selection
10. Tono — language style + energy + life focus
11. Perfil completo — "Tu ENEA está lista."

---

## Enneagram System
Based exclusively on Claudio Naranjo's characterology (Carácter y Neurosis).
9 types with their passions, fixations and psychological descriptions.
NOT the standard RHETI approach.

---

## Quote Generation
Implementado via Supabase Edge Function `generate-quote` que llama a la API de Anthropic.

Modelo: **claude-sonnet-4-6**

Cada frase:
- Máximo 2 líneas / 20 palabras
- Poética pero simple
- En español
- Generada por Claude con contexto:
  · Signo solar, lunar y Ascendente
  · Tránsitos planetarios actuales
  · Tipo de Eneagrama (caracterología Naranjo)
  · Tradición espiritual
  · Estilo de lenguaje + preferencia de energía

---

## Accessibility
WCAG 2.1 mobile guidelines applied:
- All touch targets 44x44pt minimum
- Color contrast 4.5:1 minimum
- VoiceOver labels in Spanish on all interactive elements
- No color as sole information carrier
- Logical focus order

---

## Pending Integrations
- [ ] Push notifications (daily quote delivery)
- [ ] Share quote as Instagram-ready image
- [ ] RevenueCat for subscription ($4.99/month premium)
- [ ] App Store + Google Play publishing (EAS Build)

## Integrations already done
- [x] Supabase auth (anonymous + magic link email)
- [x] Supabase user profile persistence
- [x] Anthropic Claude API (claude-sonnet-4-6) via Supabase Edge Function generate-quote

---

## Commands
- Start dev: npx expo start --clear
- iOS: npx expo start --ios  
- Android: npx expo start --android
- Web: npx expo start --web
- Type check: npx tsc --noEmit

---

## Important Notes for Claude Code
- All UI text in Spanish
- Enea speaks in first person, warm and poetic tone
- Never use generic motivational language
- The quote is always the hero element on screen
- Respect the dark aesthetic — no light backgrounds anywhere
- Planet accent colors must match user's dominant planet
- swisseph calculations must be astronomically accurateSonnet 4.6Extendido