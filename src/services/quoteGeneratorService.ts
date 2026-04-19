/**
 * quoteGeneratorService.ts
 * Llama a la Edge Function de Supabase que genera la frase con Claude.
 * La API key de Anthropic nunca toca el cliente.
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { Quote, EnneagramType, GenderPreference, NatalChart, NumerologyProfile, TonePreferences } from '@/types';
import { ENNEAGRAM_TYPES } from '@/constants/enneagram';
import { NUMEROLOGY_MEANINGS, calculateUniversalDay, calculatePersonalYear } from '@/utils/numerologyUtils';
import { signNameEs } from '@/utils/astroUtils';
import { getPlaceholderQuote } from '@/constants/placeholderQuotes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GenerateQuoteParams {
  firstName:         string;
  genderPreference:  GenderPreference;
  enneagramType:     EnneagramType | null;
  natalChart:        NatalChart | null;
  numerologyProfile: NumerologyProfile | null;
  tonePreferences:   Partial<TonePreferences>;
  birthDate:         string | undefined;
}

interface GeneratedQuote {
  text:             string;
  explanation:      string;
  planetaryContext: string;
}

// ─── Enneagram helpers ────────────────────────────────────────────────────────

const ENNEAGRAM_PASSIONS: Record<number, string> = {
  1: 'ira', 2: 'orgullo', 3: 'vanidad', 4: 'envidia',
  5: 'avaricia', 6: 'miedo', 7: 'gula', 8: 'lujuria', 9: 'pereza',
};

const ENNEAGRAM_FIXATIONS: Record<number, string> = {
  1: 'resentimiento', 2: 'adulación', 3: 'imagen', 4: 'melancolía',
  5: 'acumulación',   6: 'duda',       7: 'anticipación', 8: 'venganza', 9: 'indolencia',
};

// ─── Input sanitization ───────────────────────────────────────────────────────

/**
 * Limpia el nombre del usuario antes de incluirlo en el payload de la Edge Function.
 * Elimina caracteres de control que podrían usarse para prompt injection.
 */
function sanitizeFirstName(name: string): string {
  return (
    name
      .trim()
      .replace(/[\x00-\x1F\x7F]/g, '') // eliminar caracteres de control
      .replace(/[<>'"\\]/g, '')          // eliminar caracteres de escape/HTML
      .slice(0, 50)
  ) || 'amigo';
}

// ─── Main generator ───────────────────────────────────────────────────────────

export async function generateDailyQuote(params: GenerateQuoteParams): Promise<Quote> {
  const today = new Date().toISOString().slice(0, 10);

  try {
    const generated = await callEdgeFunction(params, today);

    return {
      id:               `quote-${today}`,
      text:             generated.text,
      explanation:      generated.explanation,
      date:             today,
      isFavorite:       false,
      planetaryContext: generated.planetaryContext,
      dominantPlanet:   params.natalChart?.dominantPlanet,
      enneagramType:    params.enneagramType ?? undefined,
    };

  } catch (err) {
    logger.warn('[QuoteGenerator] Fallback a placeholder:', err);
    // Fallback: usar placeholder si la Edge Function falla (sin conexión, etc.)
    return buildFallbackQuote(params, today);
  }
}

// ─── Edge Function call ───────────────────────────────────────────────────────

async function callEdgeFunction(
  params: GenerateQuoteParams,
  today: string,
): Promise<GeneratedQuote> {
  const { enneagramType, natalChart, numerologyProfile, tonePreferences, firstName, genderPreference, birthDate } = params;

  if (!enneagramType) throw new Error('No enneatype');

  const typeInfo    = ENNEAGRAM_TYPES[enneagramType];
  const universalDay = calculateUniversalDay();
  const personalYear = birthDate ? calculatePersonalYear(birthDate) : 1;
  const lifePathNum  = numerologyProfile?.lifePath ?? 1;
  const lifePathInfo = NUMEROLOGY_MEANINGS[lifePathNum];

  const payload = {
    firstName:           sanitizeFirstName(firstName),
    genderPreference:    genderPreference ?? 'neutro',
    enneatype:           enneagramType,
    enneatypeName:       typeInfo.name,
    enneaPassion:        ENNEAGRAM_PASSIONS[enneagramType],
    enneaFixation:       ENNEAGRAM_FIXATIONS[enneagramType],

    sunSign:             natalChart ? signNameEs(natalChart.sunSign)    : 'desconocido',
    moonSign:            natalChart ? signNameEs(natalChart.moonSign)   : 'desconocido',
    risingSign:          natalChart ? signNameEs(natalChart.risingSign) : 'desconocido',
    dominantPlanet:      natalChart?.dominantPlanet ?? 'Moon',

    lifePathNumber:      lifePathNum,
    lifePathTitle:       lifePathInfo?.title ?? '',
    universalDay,
    personalYear,

    toneStyle:           tonePreferences.languageStyle    ?? 'Poético',
    toneEnergy:          tonePreferences.energy            ?? 'Reflexivo',
    lifeFocus:           tonePreferences.lifeFocus         ?? 'Crecimiento interior',
    spiritualTradition:  tonePreferences.spiritualTradition,

    todayDate:           today,
  };

  // Sin sesión activa, el cliente Supabase envía el anon key (HS256) como Bearer.
  // La Edge Function acepta el anon key directamente (línea isValidApiKey).
  // NO crear sesión anónima: Supabase ahora emite esos tokens con ES256,
  // algoritmo que el runtime de Edge Functions rechaza con UNSUPPORTED_TOKEN_ALGORITHM.

  // Timeout de 20 s — si la Edge Function no responde, cae al fallback
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Edge Function timeout')), 20_000),
  );

  const invokePromise = supabase.functions.invoke('generate-quote', {
    body: payload,
  });

  const { data, error } = await Promise.race([invokePromise, timeoutPromise]);

  if (error) {
    // Intentar leer el body real de la respuesta HTTP
    try {
      const ctx = (error as any)?.context;
      if (ctx && typeof ctx.text === 'function') {
        const body = await ctx.text();
        logger.warn('[QuoteGenerator] Edge Function response body:', body);
      } else if (ctx && typeof ctx.json === 'function') {
        const body = await ctx.json();
        logger.warn('[QuoteGenerator] Edge Function response body:', JSON.stringify(body));
      } else {
        logger.warn('[QuoteGenerator] Edge Function error (no body):', (error as any)?.message);
      }
    } catch (e) {
      logger.warn('[QuoteGenerator] Edge Function error:', (error as any)?.message);
    }
    throw error;
  }
  if (!data?.text) throw new Error('Respuesta vacía de la Edge Function');

  // Validar que todos los campos requeridos están presentes y son strings
  const quote: GeneratedQuote = {
    text:             typeof data.text             === 'string' ? data.text.trim()             : '',
    explanation:      typeof data.explanation      === 'string' ? data.explanation.trim()      : '',
    planetaryContext: typeof data.planetaryContext === 'string' ? data.planetaryContext.trim() : '',
  };

  if (!quote.text) throw new Error('Campo text vacío en respuesta');

  return quote;
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

function buildFallbackQuote(params: GenerateQuoteParams, today: string): Quote {
  const universalDay = calculateUniversalDay();
  const placeholder  = getPlaceholderQuote(params.enneagramType, universalDay);

  return {
    id:               `quote-${today}`,
    text:             placeholder.text,
    explanation:      placeholder.explanation,
    date:             today,
    isFavorite:       false,
    planetaryContext: placeholder.planetaryContext,
    dominantPlanet:   params.natalChart?.dominantPlanet,
    enneagramType:    params.enneagramType ?? undefined,
  };
}
