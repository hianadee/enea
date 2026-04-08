/**
 * quoteGeneratorService.ts
 * Llama a la Edge Function de Supabase que genera la frase con Claude.
 * La API key de Anthropic nunca toca el cliente.
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { Quote, EnneagramType, NatalChart, NumerologyProfile, TonePreferences } from '@/types';
import { ENNEAGRAM_TYPES } from '@/constants/enneagram';
import { NUMEROLOGY_MEANINGS, calculateUniversalDay, calculatePersonalYear } from '@/utils/numerologyUtils';
import { signNameEs } from '@/utils/astroUtils';
import { getPlaceholderQuote } from '@/constants/placeholderQuotes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GenerateQuoteParams {
  firstName:         string;
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
  const { enneagramType, natalChart, numerologyProfile, tonePreferences, firstName, birthDate } = params;

  if (!enneagramType) throw new Error('No enneatype');

  const typeInfo    = ENNEAGRAM_TYPES[enneagramType];
  const universalDay = calculateUniversalDay();
  const personalYear = birthDate ? calculatePersonalYear(birthDate) : 1;
  const lifePathNum  = numerologyProfile?.lifePath ?? 1;
  const lifePathInfo = NUMEROLOGY_MEANINGS[lifePathNum];

  const payload = {
    firstName:           sanitizeFirstName(firstName),
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

  const { data, error } = await supabase.functions.invoke('generate-quote', {
    body: payload,
  });

  if (error) throw error;
  if (!data?.text) throw new Error('Respuesta vacía de la Edge Function');

  return data as GeneratedQuote;
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
