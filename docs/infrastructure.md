# ENEA — Infraestructura y Servicios

## Servicios activos

### Supabase (Base de datos + Auth)
- **Plan**: Free
- **Proyecto**: enea
- **Región**: EU (West)
- **Dashboard**: https://supabase.com/dashboard/project/myghlqincyftpuntehkp
- **Límites Free Plan**:
  | Recurso | Límite | Uso actual |
  |---|---|---|
  | Database | 500 MB | ~27 MB |
  | Egress | 5 GB/mes | ~1 MB |
  | MAU | 50.000 | 2 |
  | Edge Functions | 500.000/mes | 27 |
  | SMTP (emails) | 3/hora | — |
- **Comportamiento al superar límite**: el proyecto se pausa automáticamente sin previo aviso
- **Cuándo subir a Pro ($25/mes)**: al llegar a ~30.000 MAU o si el proyecto se pausa
- **Alertas**: no disponibles en Free Plan — revisar Usage manualmente 1x/semana

### PostHog (Analytics)
- **Plan**: Free (1M eventos/mes)
- **Proyecto**: Default project
- **Región**: EU Cloud
- **Dashboard**: https://eu.posthog.com
- **Eventos tracked**:
  - `onboarding_start`
  - `onboarding_name_entered`
  - `onboarding_birth_date_set`
  - `onboarding_birth_place_set`
  - `onboarding_birth_time_set`
  - `onboarding_enneagram_result_seen` (incluye `type`)
  - `onboarding_completed`
- **DAU/MAU**: automático via `$app_opened`
- **Límite**: 1M eventos/mes gratis — con los eventos actuales aguanta ~140.000 usuarios/mes

### Sentry (Crash monitoring)
- **Plan**: Free (5.000 errores/mes)
- **Proyecto**: react-native / equipo #enea
- **Región**: EU (ingest.de.sentry.io)
- **Dashboard**: https://enea.sentry.io
- **Alertas**: email en errores de alta prioridad (configurado al crear proyecto)
- **Configuración**: `tracesSampleRate: 0.2`, entorno development/production automático
- **Cuándo subir de plan**: si superas 5.000 errores/mes (señal de problema grave)

### Anthropic Claude (Generación de frases)
- **Modelo**: claude-sonnet-4-6
- **Dashboard**: https://console.anthropic.com
- **Configurar límites**: Settings → Billing → Usage limits
  - Hard limit: cantidad máxima en $ que nunca se superará
  - Soft limit: alerta por email al alcanzar el % definido
- **Coste estimado por frase**: ~$0.003 (Sonnet, ~500 tokens)
- **Coste estimado 1.000 usuarios diarios**: ~$3/día

---

## Seguridad (Supabase)

| Configuración | Estado |
|---|---|
| RLS en todas las tablas | ✅ |
| Refresh token rotation | ✅ (detect/revoke ON, reuse 10s) |
| Legacy JWT revocado | ✅ |
| JWT expiry | ✅ 3600s |
| Confirm email | ✅ ON |
| CAPTCHA | ⏸️ pospuesto (requiere integración en app) |

---

## Builds (EAS)

- **Plataforma**: Expo Application Services
- **Perfil producción**: `eas build --platform android --profile production`
- **Auto-increment versionCode**: activado en eas.json
- **Variables de entorno en EAS**: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_POSTHOG_KEY

---

## Variables de entorno

| Variable | Servicio | Tipo |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase | Pública |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Pública (anon) |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog | Pública (write-only) |
| DSN Sentry | Sentry | Hardcoded en App.tsx (write-only) |

> Las claves `EXPO_PUBLIC_*` son seguras para incluir en el bundle del cliente.
> `.env` está en `.gitignore` — nunca se commitea.

---

## Checklist antes de cada release

- [ ] Revisar Usage en Supabase dashboard
- [ ] Revisar errores nuevos en Sentry
- [ ] Revisar funnel de onboarding en PostHog
- [ ] Verificar que `versionCode` (Android) y `buildNumber` (iOS) han subido
- [ ] `eas build --platform android --profile production`
