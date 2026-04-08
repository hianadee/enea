/**
 * quotesService.ts
 * Lectura y escritura de frases diarias en Supabase.
 * Mapea con Quote (quoteStore) y daily_quotes (tabla).
 */

import { supabase } from '@/lib/supabase';
import { Quote, EnneagramType, DominantPlanet, TonePreferences } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuoteRow {
  id:                 string;
  user_id:            string;
  quote_date:         string;
  quote_text:         string;
  explanation:        string | null;
  dominant_planet:    string | null;
  planetary_context:  string | null;
  astrology_context:  object | null;
  enneatype:          number | null;
  enneagram_context:  object | null;
  tone:               object | null;
  originality_hash:   string | null;
  is_favorite:        boolean;
  created_at:         string;
}

// ─── Converters ───────────────────────────────────────────────────────────────

function rowToQuote(row: QuoteRow): Quote {
  return {
    id:               row.id,
    text:             row.quote_text,
    explanation:      row.explanation ?? '',
    date:             row.quote_date,
    isFavorite:       row.is_favorite,
    planetaryContext: row.planetary_context ?? undefined,
    dominantPlanet:   (row.dominant_planet as DominantPlanet) ?? undefined,
    enneagramType:    row.enneatype ? (row.enneatype as EnneagramType) : undefined,
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/** Guarda la frase del día (upsert — si ya existe para esa fecha, no la duplica) */
export async function saveQuote(params: {
  quote:            Quote;
  tonePreferences?: Partial<TonePreferences>;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const { quote, tonePreferences } = params;

  const { error } = await supabase
    .from('daily_quotes')
    .upsert(
      {
        user_id:           user.id,
        quote_date:        quote.date,
        quote_text:        quote.text,
        explanation:       quote.explanation,
        dominant_planet:   quote.dominantPlanet ?? null,
        planetary_context: quote.planetaryContext ?? null,
        enneatype:         quote.enneagramType ?? null,
        tone:              tonePreferences ?? null,
        is_favorite:       quote.isFavorite,
      },
      { onConflict: 'user_id,quote_date' }
    );

  if (error) throw error;
}

/** Lee la frase de hoy */
export async function fetchTodayQuote(): Promise<Quote | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('daily_quotes')
    .select('*')
    .eq('user_id', user.id)
    .eq('quote_date', today)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no existe todavía
    throw error;
  }

  return rowToQuote(data as QuoteRow);
}

/** Lee el historial de frases (más reciente primero) */
export async function fetchQuoteHistory(limit = 30): Promise<Quote[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('daily_quotes')
    .select('*')
    .eq('user_id', user.id)
    .order('quote_date', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as QuoteRow[]).map(rowToQuote);
}

/** Lee solo las frases guardadas como favoritas */
export async function fetchFavorites(): Promise<Quote[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('daily_quotes')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_favorite', true)
    .order('quote_date', { ascending: false });

  if (error) throw error;

  return (data as QuoteRow[]).map(rowToQuote);
}

/** Alterna el estado de favorito de una frase */
export async function toggleFavorite(quoteId: string, isFavorite: boolean): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const { error } = await supabase
    .from('daily_quotes')
    .update({ is_favorite: isFavorite })
    .eq('id', quoteId)
    .eq('user_id', user.id); // RLS extra check

  if (error) throw error;
}
