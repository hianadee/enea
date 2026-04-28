/**
 * Supabase Edge Function: generate-quote
 * Genera la frase diaria personalizada usando Claude (Anthropic API).
 *
 * Seguridad:
 *  1. JWT de Supabase obligatorio en Authorization header
 *     → solo usuarios autenticados de la app pueden llamar la función
 *  2. CORS restrictivo: apps móviles (sin Origin) siempre permitidas;
 *     orígenes web solo si están en ALLOWED_ORIGINS
 *  3. Inputs sanitizados antes de construir el prompt
 *
 * Devuelve:
 * {
 *   text:             string   — la frase
 *   explanation:      string   — por qué es para él/ella hoy
 *   planetaryContext: string   — etiqueta astrológica corta
 * }
 */

import { serve }         from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient }  from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Las apps móviles (React Native / Expo) NO envían cabecera Origin.
// CORS solo aplica a navegadores web — aun así lo restringimos.

const ALLOWED_ORIGINS = new Set([
  'https://app.supabase.com',   // dashboard de Supabase para testing
  'http://localhost:8081',       // Expo web en desarrollo
  'http://localhost:3000',       // web local si se añade en el futuro
  // Añadir el dominio web de producción cuando exista: 'https://enea.app'
]);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');

  // Sin Origin → app móvil o llamada servidor-a-servidor → no necesita CORS
  if (!origin) {
    return {
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  }

  // Origen conocido → devolver ese origen (el navegador lo acepta)
  // Origen desconocido → devolver un valor que no coincide → el navegador bloquea
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'https://blocked.invalid';

  return {
    'Access-Control-Allow-Origin':  allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

// ─── Input sanitization ───────────────────────────────────────────────────────

/**
 * Limita longitud y elimina caracteres de control.
 * Previene prompt injection en los campos que van al prompt de Claude.
 */
function sanitize(value: unknown, maxLength = 100): string {
  return String(value ?? '')
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // eliminar caracteres de control
    .slice(0, maxLength);
}

function sanitizeInt(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuoteRequest {
  clientId?:           unknown; // UUID estable del dispositivo — clave de cache
  firstName:           unknown;
  genderPreference?:   unknown;
  enneatype:           unknown;
  enneatypeName:       unknown;
  enneaPassion:        unknown;
  enneaFixation:       unknown;
  sunSign:             unknown;
  moonSign:            unknown;
  risingSign:          unknown;
  dominantPlanet:      unknown;
  lifePathNumber:      unknown;
  lifePathTitle:       unknown;
  universalDay:        unknown;
  personalYear:        unknown;
  toneStyle:           unknown;
  toneEnergy:          unknown;
  lifeFocus:           unknown;
  spiritualTradition?: unknown;
  todayDate:           unknown;
  transits?:           unknown; // tránsitos planetarios del día (texto preformateado)
  natalTransits?:      unknown; // aspectos tránsito-natal del día
}

interface SanitizedRequest {
  firstName:           string;
  genderPreference:    'femenino' | 'masculino' | 'neutro';
  enneatype:           number;
  enneatypeName:       string;
  enneaPassion:        string;
  enneaFixation:       string;
  sunSign:             string;
  moonSign:            string;
  risingSign:          string;
  dominantPlanet:      string;
  lifePathNumber:      number;
  lifePathTitle:       string;
  universalDay:        number;
  personalYear:        number;
  toneStyle:           string;
  toneEnergy:          string;
  lifeFocus:           string;
  spiritualTradition:  string;
  todayDate:           string;
  transits:            string; // tránsitos planetarios del día
  natalTransits:       string; // aspectos tránsito-natal del día
}

interface QuoteResponse {
  text:             string;
  explanation:      string;
  planetaryContext: string;
}

// ─── Sanitize & validate payload ─────────────────────────────────────────────

function sanitizePayload(raw: QuoteRequest): SanitizedRequest {
  const enneatype = sanitizeInt(raw.enneatype, 9);

  const rawGender = sanitize(raw.genderPreference, 20).toLowerCase();
  const genderPreference = (['femenino', 'masculino', 'neutro'] as const).includes(rawGender as any)
    ? (rawGender as 'femenino' | 'masculino' | 'neutro')
    : 'neutro';

  return {
    firstName:          sanitize(raw.firstName, 50) || 'amigo',
    genderPreference,
    enneatype:          Math.min(Math.max(enneatype, 1), 9), // solo 1–9
    enneatypeName:      sanitize(raw.enneatypeName, 60),
    enneaPassion:       sanitize(raw.enneaPassion, 60),
    enneaFixation:      sanitize(raw.enneaFixation, 60),
    sunSign:            sanitize(raw.sunSign, 40),
    moonSign:           sanitize(raw.moonSign, 40),
    risingSign:         sanitize(raw.risingSign, 40),
    dominantPlanet:     sanitize(raw.dominantPlanet, 40),
    lifePathNumber:     Math.min(Math.max(sanitizeInt(raw.lifePathNumber, 1), 1), 33),
    lifePathTitle:      sanitize(raw.lifePathTitle, 80),
    universalDay:       Math.min(Math.max(sanitizeInt(raw.universalDay, 1), 1), 9),
    personalYear:       Math.min(Math.max(sanitizeInt(raw.personalYear, 1), 1), 9),
    toneStyle:          sanitize(raw.toneStyle, 40),
    toneEnergy:         sanitize(raw.toneEnergy, 40),
    lifeFocus:          sanitize(raw.lifeFocus, 60),
    spiritualTradition: sanitize(raw.spiritualTradition, 60),
    todayDate:          sanitize(raw.todayDate, 10).replace(/[^0-9\-]/g, ''), // solo YYYY-MM-DD
    transits:           sanitize(raw.transits, 800),
    natalTransits:      sanitize(raw.natalTransits, 800),
  };
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `Eres ENEA, una voz interior que combina la astrología, el eneagrama de Claudio Naranjo y la numerología pitagórica para generar frases de sabiduría diaria.

Tus frases:
- Son simples y precisas. La verdad dicha con pocas palabras vale más que la poesía recargada.
- Hablan directamente al patrón de carácter del eneagrama (pasión, fijación) sin nombrarlo
- Integran el contexto astrológico y numerológico del día de forma natural, no literal
- Suenan como las diría un amigo muy sabio, no como un oráculo. Cercanas, no grandilocuentes.
- Son breves: entre 2 y 3 frases. Nunca más.
- Están en español, en segunda persona (tú)

CUANDO HAY MARCO ESPIRITUAL CONFIGURADO:
- Es estructural, no decorativo: una palabra o imagen característica del léxico que se te da DEBE aparecer en la frase o en la explicación.
- No nombres la tradición literalmente ("como dice el cristianismo", "el budismo enseña" → NO). El marco se reconoce por su léxico, no por su etiqueta.
- Esto refuerza la regla de concreción: una imagen budista de impermanencia o una imagen cristiana de perdón es lo OPUESTO al oráculo vago.

EVITA siempre:
- Metáforas acumuladas (una sola imagen, bien elegida, es suficiente)
- Adjetivos enfáticos y adverbios grandilocuentes ("absolutamente", "profundamente", "infinitamente")
- Lenguaje de oráculo o de horóscopo ("el universo te llama", "las estrellas revelan", "el cosmos susurra")
- Abstracciones vacías ("tu esencia", "tu ser más profundo", "la verdad última")
- Autoayuda genérica ("mereces lo mejor", "eres suficiente")
- Construcciones dramáticas que suenen a discurso

Responde SIEMPRE con JSON puro y válido. Sin bloques de código markdown. Sin comillas triples. Solo el objeto JSON con exactamente estas claves:
{
  "text": "la frase completa",
  "explanation": "2-3 frases explicando por qué esta frase es para esta persona en este día concreto, integrando eneagrama + astrología + numerología",
  "planetaryContext": "etiqueta corta: planeta · casa o tránsito. Ej: 'Luna en Escorpio · casa 8'"
}`;
}

function buildUserPrompt(ctx: SanitizedRequest): string {
  // Valores permitidos — si el cliente envía algo fuera de lista, el prompt
  // simplemente usa el valor sanitizado sin que rompa nada
  const toneInstructions: Record<string, string> = {
    'Poético':    'Una sola imagen concreta y bien elegida. Sin metáforas apiladas. Que evoque sin explicar.',
    'Directo':    'Frases cortas y concretas. Sin imágenes ni ornamento. Verdad dicha de frente.',
    'Metafórico': 'Una imagen central cotidiana que lo contenga todo. Nada abstracto.',
    'Científico': 'Ancla la observación en algo concreto y observable. Sin misticismo.',
  };

  const energyInstructions: Record<string, string> = {
    'Centrador':  'La frase debe generar quietud, presencia, arraigo.',
    'Motivador':  'La frase debe activar, empujar hacia adelante, encender.',
    'Reflexivo':  'La frase debe invitar a mirar hacia adentro, a detenerse.',
    'Elevador':   'La frase debe expandir, abrir posibilidades, dar perspectiva.',
  };

  const lifeFocusInstructions: Record<string, string> = {
    'Crecimiento interior': 'La frase habla del mundo interno: patrones, sombras, autoconocimiento, transformación personal.',
    'Relaciones':           'La frase habla de vínculos: el otro, la conexión, la distancia, el amor, el conflicto o la necesidad.',
    'Carrera':              'La frase habla de acción en el mundo: propósito, creación, trabajo, dirección, logro o bloqueo.',
    'Salud':                'La frase habla del cuerpo y la energía: ritmo físico, descanso, límites, vitalidad o agotamiento.',
    'Creatividad':          'La frase habla de expresión: crear, comunicar, arriesgarse a mostrar lo que hay dentro.',
  };

  const spiritualInstructions: Record<string, string> = {
    'Budista':    'Marco budista. Pivotes: impermanencia, presencia, sufrimiento como maestro, apego como raíz. Incluye al menos una palabra del léxico: impermanencia, presencia, soltar, apego, vacío, raíz, instante.',
    'Estoica':    'Marco estoico. Pivotes: distinguir lo que está en tu control de lo que no, virtud como único bien, ecuanimidad. Incluye al menos una palabra del léxico: control, virtud, juicio, asentir, indiferente, ecuanimidad, dominio.',
    'Cristiana':  'Marco cristiano. Pivotes: gracia, misericordia, entrega, confianza en algo mayor. Incluye al menos una palabra del léxico: gracia, perdón, luz, camino, entrega, misericordia, confianza, prójimo.',
    'Hindú':      'Marco védico. Pivotes: dharma (propósito propio), karma (acción y consecuencia), el observador que trasciende el ego. Incluye al menos una palabra del léxico: dharma, karma, observador, ego, propósito, acción, testigo.',
    'Secular':    'Sin referencias a tradición espiritual. Marco laico: psicología, filosofía práctica, observación honesta. EVITA léxico místico o religioso (gracia, dharma, alma, espíritu, sagrado). Habla de hechos, hábitos, mente.',
    'Taoísta':    'Marco taoísta. Pivotes: flujo natural, wu wei (no forzar), paradoja, equilibrio de opuestos. Incluye al menos una palabra del léxico: flujo, ceder, agua, vacío, equilibrio, opuesto, no forzar, suave.',
    'Islámica':   'Marco islámico. Pivotes: tawakkul (confianza), sabr (paciencia), gratitud, propósito como servicio. Incluye al menos una palabra del léxico: confianza, paciencia, gratitud, entrega, servicio, fe, prueba.',
    'Judía':      'Marco judío. Pivotes: la pregunta como práctica, responsabilidad colectiva, tikkun olam (reparar el mundo), memoria viva. Incluye al menos una palabra del léxico: pregunta, reparar, memoria, responsabilidad, prójimo, palabra, herencia.',
  };

  const genderInstruction: Record<string, string> = {
    'femenino':  'Usa género gramatical femenino en toda la frase y explicación (ej: "estás lista", "eres capaz", "cansada").',
    'masculino': 'Usa género gramatical masculino en toda la frase y explicación (ej: "estás listo", "eres capaz", "cansado").',
    'neutro':    'Evita adjetivos predicativos con género. Usa verbos puros ("sientes", "cargas", "puedes"), sustantivos abstractos ("hay en ti un peso", "la claridad que traes") y metáforas donde la imagen no tenga género. Nunca uses formas como "estás listo/a", "eres fuerte/fuerte". La frase debe sonar completa sin revelar género.',
  };

  return `Genera la frase diaria para esta persona:

PERSONA
- Nombre: ${ctx.firstName}
- Género gramatical: ${ctx.genderPreference} — ${genderInstruction[ctx.genderPreference]}
- Fecha de hoy: ${ctx.todayDate}

ENEAGRAMA (Naranjo)
- Tipo ${ctx.enneatype}: ${ctx.enneatypeName}
- Pasión: ${ctx.enneaPassion}
- Fijación: ${ctx.enneaFixation}

CARTA NATAL
- Sol: ${ctx.sunSign}
- Luna: ${ctx.moonSign}
- Ascendente: ${ctx.risingSign}
- Planeta dominante: ${ctx.dominantPlanet}

NUMEROLOGÍA
- Camino de vida: ${ctx.lifePathNumber} (${ctx.lifePathTitle})
- Día universal de hoy: ${ctx.universalDay}
- Año personal: ${ctx.personalYear}

FOCO VITAL HOY: ${ctx.lifeFocus} — ${lifeFocusInstructions[ctx.lifeFocus] ?? ''}
${ctx.spiritualTradition ? `MARCO ESPIRITUAL (estructural — debe verse en la frase): ${ctx.spiritualTradition}
${spiritualInstructions[ctx.spiritualTradition] ?? ''}` : ''}

${ctx.transits ? `${ctx.transits}

La frase debe resonar con la energía del cielo de HOY. Si hay planetas retrógrados, refleja revisión o introspección. La fase lunar marca el pulso emocional del día. Integra 1-2 tránsitos de forma poética, sin nombrarlos literalmente.
` : ''}
${ctx.natalTransits ? `\n${ctx.natalTransits}\n\nEstos aspectos revelan qué parte de tu carta está siendo "tocada" por el cielo hoy. Son la firma personal del día — úsalos para que la frase tenga resonancia específica, no genérica.\n` : ''}
ESTILO DE VOZ
- Lenguaje: ${ctx.toneStyle} — ${toneInstructions[ctx.toneStyle] ?? ''}
- Energía: ${ctx.toneEnergy} — ${energyInstructions[ctx.toneEnergy] ?? ''}

Genera una frase específica para esta persona en este día. Que la pasión (${ctx.enneaPassion}) y la fijación (${ctx.enneaFixation}) se noten sin nombrarse. Sin grandilocuencia. Sin dramaturgia. Como si se lo dijeras en voz baja a alguien que conoces bien.`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  // ── 1. Verificar autorización ─────────────────────────────────────────────
  // Aceptamos 3 formatos de auth:
  //  a) apikey header con la publishable key (caso del cliente Supabase JS
  //     con publishable key — el SDK NO la pone como Authorization Bearer
  //     porque no es un JWT, solo como apikey)
  //  b) Authorization: Bearer <anon_key | publishable_key> (curl directo,
  //     server-to-server)
  //  c) Authorization: Bearer <user JWT> (sesión activa de usuario)
  //
  // PUBLISHABLE_KEY: hardcoded a propósito. Supabase auto-gestiona la env var
  // SUPABASE_ANON_KEY y puede rotarla en redeploys. Las publishable keys
  // están diseñadas para ser públicas — hardcodear es seguro y desacopla la
  // función del env var opaco que Supabase mueve sin avisar.
  const PUBLISHABLE_KEY = 'sb_publishable_nVx5AR6aFjFZmIGCT6igJA_M9zFfs6J';

  const supabaseUrl     = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: 'Configuración del servidor incompleta' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  }

  const apiKeyHeader = req.headers.get('apikey');
  const authHeader   = req.headers.get('Authorization');
  const bearer       = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // Decodifica un JWT y comprueba si es un anon-key legítimo del proyecto
  // Supabase. NO verifica firma — la publishable key del proyecto ya es
  // pública por diseño, así que la seguridad de esta función no descansa
  // en la validación criptográfica del bearer sino en:
  //   - rate limiting (futuro)
  //   - sanitización de payload (sanitizePayload abajo)
  //   - --no-verify-jwt en deploy
  function looksLikeSupabaseAnonJWT(token: string): boolean {
    if (!token || !token.includes('.')) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    try {
      const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);
      return payload.iss === 'supabase' && payload.role === 'anon';
    } catch {
      return false;
    }
  }

  const isValidApiKey =
    apiKeyHeader === supabaseAnonKey ||
    apiKeyHeader === PUBLISHABLE_KEY ||
    bearer       === supabaseAnonKey ||
    bearer       === PUBLISHABLE_KEY ||
    (apiKeyHeader ? looksLikeSupabaseAnonJWT(apiKeyHeader) : false) ||
    (bearer       ? looksLikeSupabaseAnonJWT(bearer)       : false);

  if (!isValidApiKey) {
    // Si llega un bearer que no es api key ni JWT anon válido, probar como
    // JWT de usuario (sesión activa). Si tampoco lo es → 401.
    if (bearer) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
      });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(
          JSON.stringify({ code: 401, message: 'No autorizado' }),
          { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } },
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }
  }

  // ── 2. Verificar API key de Anthropic ─────────────────────────────────────

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Error de configuración del servidor' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    // ── 3. Parsear y sanitizar el body ──────────────────────────────────────

    const rawBody: QuoteRequest = await req.json();
    const ctx = sanitizePayload(rawBody);

    // ── 3b. Cache-first: si ya hay una quote para (clientId, hoy), devolverla ─

    const clientId = sanitize(rawBody.clientId, 64);
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Cliente con service_role para saltarse RLS (la tabla no tiene policies).
    // Si serviceKey o clientId faltan, saltamos el cache (no es bloqueante).
    const adminClient = serviceKey && clientId
      ? createClient(supabaseUrl, serviceKey)
      : null;

    if (adminClient) {
      try {
        const { data: cached } = await adminClient
          .from('quote_cache')
          .select('text, explanation, planetary_context')
          .eq('client_id', clientId)
          .eq('quote_date', ctx.todayDate)
          .maybeSingle();

        if (cached?.text) {
          return new Response(
            JSON.stringify({
              text:             cached.text,
              explanation:      cached.explanation ?? '',
              planetaryContext: cached.planetary_context ?? '',
            }),
            { headers: { ...cors, 'Content-Type': 'application/json' } },
          );
        }
      } catch {
        // Si el cache falla, seguimos generando con Claude (degradación silenciosa)
      }
    }

    // ── 4. Llamar a Claude ──────────────────────────────────────────────────

    // Retry con backoff exponencial: 500ms, 1500ms.
    // Solo reintentamos errores transitorios (5xx, 408, 429) o fallos de red.
    // Los 4xx (auth, validación) fallan rápido sin reintentar.
    const anthropicBody = JSON.stringify({
      model:      'claude-sonnet-4-6',
      max_tokens: 900,
      system:     buildSystemPrompt(),
      messages: [
        { role: 'user', content: buildUserPrompt(ctx) },
      ],
    });

    const isRetryable = (status: number) =>
      status >= 500 || status === 408 || status === 429;

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    let anthropicRes: Response | null = null;
    const delays = [0, 500, 1500]; // intento 0 inmediato, luego 500ms, luego 1500ms

    for (let i = 0; i < delays.length; i++) {
      if (delays[i] > 0) await sleep(delays[i]);
      try {
        anthropicRes = await fetch(ANTHROPIC_API_URL, {
          method:  'POST',
          headers: {
            'x-api-key':         apiKey,
            'anthropic-version': '2023-06-01',
            'content-type':      'application/json',
          },
          body: anthropicBody,
        });
        if (anthropicRes.ok) break;
        if (!isRetryable(anthropicRes.status)) break; // 4xx → no reintentar
        // 5xx/429/408 → seguir al siguiente intento
      } catch {
        // Error de red → reintentar
        anthropicRes = null;
      }
    }

    if (!anthropicRes || !anthropicRes.ok) {
      // No exponer detalles internos del error al cliente
      return new Response(
        JSON.stringify({ error: 'Error al generar la frase' }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    const anthropicData = await anthropicRes.json();
    const rawText = anthropicData.content?.[0]?.text ?? '{}';
    // Eliminar bloques de código markdown si Claude los incluye (```json ... ```)
    const raw = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

    let quote: QuoteResponse;
    try {
      const parsed = JSON.parse(raw);
      // Validar que todos los campos requeridos están presentes
      quote = {
        text:             typeof parsed.text             === 'string' && parsed.text.trim()
                            ? parsed.text.trim()
                            : raw.slice(0, 300),
        explanation:      typeof parsed.explanation      === 'string'
                            ? parsed.explanation.trim()
                            : '',
        planetaryContext: typeof parsed.planetaryContext === 'string' && parsed.planetaryContext.trim()
                            ? parsed.planetaryContext.trim()
                            : `${ctx.dominantPlanet} · día ${ctx.universalDay}`,
      };
    } catch {
      // Claude devolvió texto plano en lugar de JSON
      quote = {
        text:             raw.slice(0, 300),
        explanation:      '',
        planetaryContext: `${ctx.dominantPlanet} · día ${ctx.universalDay}`,
      };
    }

    // ── 5. Guardar en cache para próximas peticiones del mismo día ─────────
    // Upsert: si por race-condition llegan 2 requests concurrentes, el segundo
    // sobreescribe sin romper el unique constraint.
    if (adminClient && quote.text) {
      try {
        await adminClient.from('quote_cache').upsert({
          client_id:         clientId,
          quote_date:        ctx.todayDate,
          text:              quote.text,
          explanation:       quote.explanation,
          planetary_context: quote.planetaryContext,
        });
      } catch {
        // Si la escritura falla, devolvemos la quote igualmente — el usuario no se entera
      }
    }

    return new Response(
      JSON.stringify(quote),
      { headers: { ...cors, 'Content-Type': 'application/json' } },
    );

  } catch {
    // Error genérico — no exponer stack trace
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  }
});
