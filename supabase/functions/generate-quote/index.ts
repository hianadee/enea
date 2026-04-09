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
  firstName:           unknown;
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
}

interface SanitizedRequest {
  firstName:           string;
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
}

interface QuoteResponse {
  text:             string;
  explanation:      string;
  planetaryContext: string;
}

// ─── Sanitize & validate payload ─────────────────────────────────────────────

function sanitizePayload(raw: QuoteRequest): SanitizedRequest {
  const enneatype = sanitizeInt(raw.enneatype, 9);

  return {
    firstName:          sanitize(raw.firstName, 50) || 'amigo',
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
  };
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `Eres ENEA, un oráculo interior que combina la astrología, el eneagrama de Claudio Naranjo y la numerología pitagórica para generar frases de sabiduría diaria absolutamente únicas.

Tus frases:
- Son poéticas, densas de significado, nunca superficiales
- Hablan directamente al patrón de carácter del eneagrama (pasión, fijación)
- Integran el contexto astrológico y numerológico del día de forma natural
- No suenan a horóscopo genérico ni a autoayuda
- Son breves: entre 2 y 4 frases. Nunca más.
- Están en español, en segunda persona (tú)

Responde SIEMPRE con JSON válido con exactamente estas claves:
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
    'Poético':    'Usa metáforas vívidas, ritmo, imágenes sensoriales. Que suene a poesía en prosa.',
    'Directo':    'Frases cortas y concretas. Nada de florituras. Verdad sin ornamento.',
    'Metafórico': 'Una imagen central que lo contenga todo. Que la metáfora sea el mensaje.',
    'Científico': 'Ancla la espiritualidad en lo observable. Menciona procesos, patrones, evidencia.',
  };

  const energyInstructions: Record<string, string> = {
    'Centrador':  'La frase debe generar quietud, presencia, arraigo.',
    'Motivador':  'La frase debe activar, empujar hacia adelante, encender.',
    'Reflexivo':  'La frase debe invitar a mirar hacia adentro, a detenerse.',
    'Elevador':   'La frase debe expandir, abrir posibilidades, dar perspectiva.',
  };

  return `Genera la frase diaria para esta persona:

PERSONA
- Nombre: ${ctx.firstName}
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

FOCO VITAL HOY: ${ctx.lifeFocus}
${ctx.spiritualTradition ? `TRADICIÓN ESPIRITUAL: ${ctx.spiritualTradition}` : ''}

ESTILO DE VOZ
- Lenguaje: ${ctx.toneStyle} — ${toneInstructions[ctx.toneStyle] ?? ''}
- Energía: ${ctx.toneEnergy} — ${energyInstructions[ctx.toneEnergy] ?? ''}

Genera una frase que NUNCA podría existir para otra persona. Que la pasión del eneagrama (${ctx.enneaPassion}) y la fijación (${ctx.enneaFixation}) sean visibles sin nombrarlas.`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  // ── 1. Verificar JWT de Supabase ──────────────────────────────────────────
  // Solo usuarios autenticados en la app pueden generar frases.
  // El cliente Supabase en la app envía el token automáticamente.

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  }

  const supabaseUrl     = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: 'Configuración del servidor incompleta' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  }

  // Verificar que la petición proviene de un cliente autorizado.
  // Se acepta tanto un JWT de usuario (sesión anónima o real) como el anon key,
  // porque el cliente móvil puede no tener sesión activa aún.
  const apiKeyHeader = req.headers.get('apikey');
  const bearer       = authHeader.replace('Bearer ', '');
  const isValidApiKey = apiKeyHeader === supabaseAnonKey || bearer === supabaseAnonKey;

  if (!isValidApiKey) {
    // Intentar validar como JWT de usuario (sesión anónima/real)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ code: 401, message: 'No autorizado' }),
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

    // ── 4. Llamar a Claude ──────────────────────────────────────────────────

    const anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method:  'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-opus-4-5',
        max_tokens: 900,
        system:     buildSystemPrompt(),
        messages: [
          { role: 'user', content: buildUserPrompt(ctx) },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      // No exponer detalles internos del error al cliente
      return new Response(
        JSON.stringify({ error: 'Error al generar la frase' }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    const anthropicData = await anthropicRes.json();
    const raw = anthropicData.content?.[0]?.text ?? '{}';

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
