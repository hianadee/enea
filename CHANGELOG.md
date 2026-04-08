# Changelog

Todos los cambios notables de ENEA se documentan en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).
Versionado siguiendo [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.1.0] - 2026-04-08

### Added
- Splash screen con identidad visual ENEA
- Onboarding completo de 10 pasos:
  - Paso 1: Pantalla de bienvenida
  - Paso 2: Nombre del usuario
  - Paso 3: Fecha de nacimiento
  - Paso 4: Lugar de nacimiento
  - Paso 5: Hora de nacimiento
  - Paso 6: Visualización de carta natal (SVG, Swiss Ephemeris)
  - Paso 7: Test de tipo Enneagram (modelo Claudio Naranjo)
  - Paso 8: Screening de creencia espiritual / religiosa
  - Paso 9: Selector de tradición religiosa (condicional)
  - Paso 10: Preferencias de tono y estilo de lenguaje
- Design system completo (colores, tipografía, espaciado, componentes base)
- Componentes: InputLabel (default/selected), Tab chips (unselected/selected)
- Navegación principal con tab bar: Daily Quote, Journal, Favorites, Settings
- Pantalla Daily Quote (contenido placeholder)
- Pantalla Journal
- Pantalla Favorites
- Pantalla Settings
- Sistema de notificaciones locales diarias (iOS y Android)
- Store global con Zustand (usuario, preferencias, notificaciones)
- Cálculo de carta natal con swisseph (Sol, Luna, Ascendente)
- Icono de app y splash screen con identidad visual premium

### Security
- Tokens de sesión almacenados en Keychain (iOS) / EncryptedSharedPreferences (Android) vía expo-secure-store
- CORS restrictivo en Edge Functions (lista de orígenes permitidos + Vary: Origin)
- JWT de Supabase verificado en cada llamada a la Edge Function
- Rate limiting cliente para verificación OTP (máx 5 intentos / 15 min)
- Validación de formato de email antes de enviar a Supabase
- Sanitización de inputs de usuario antes de incluir en prompts de IA
- Validación de ruta en deep links (solo `enea://auth/callback` permitido)
- Logger de producción con gate `__DEV__` (sin fugas de información en builds release)

### Technical
- React Native + Expo SDK 54
- TypeScript strict mode
- Zustand v5 para estado global con persistencia AsyncStorage
- react-native-svg para visualizaciones de carta natal
- expo-notifications ~0.32.16 para notificaciones locales
- Swiss Ephemeris (swisseph) para cálculos astrológicos precisos
- Supabase Edge Functions con Deno para generación de frases (Claude API)
- expo-secure-store para almacenamiento seguro de credenciales
