import { create } from 'zustand';
import { Quote, EnneagramType, DominantPlanet } from '@/types';
import { PLACEHOLDER_QUOTES } from '@/constants/placeholderQuotes';

const SEED_PLANETS: DominantPlanet[] = [
  'Moon', 'Venus', 'Neptune', 'Jupiter', 'Saturn',
  'Mercury', 'Sun', 'Mars', 'Uranus', 'Pluto',
];

const SEED_CONTEXTS: Record<DominantPlanet, string[]> = {
  Moon:    ['Luna en Cáncer', 'Tránsito lunar · casa 4', 'Luna llena en oposición'],
  Venus:   ['Venus · casa 7', 'Venus trígono Sol natal', 'Venus en Libra'],
  Neptune: ['Neptuno · casa 8', 'Neptuno sextil Luna', 'Tránsito Neptuno · casa 12'],
  Jupiter: ['Júpiter trígono Sol natal', 'Júpiter · casa 9', 'Júpiter conjunción Mercurio'],
  Saturn:  ['Saturno · tránsito casa 6', 'Saturno cuadrado Júpiter natal', 'Retorno de Saturno'],
  Mercury: ['Mercurio conjunto Júpiter natal', 'Mercurio Rx · casa 10', 'Mercurio en Géminis'],
  Sun:     ['Retorno solar · casa 1', 'Sol · tránsito casa 11', 'Sol oposición Luna natal'],
  Mars:    ['Marte · activación casa 1', 'Marte oposición Luna natal', 'Marte trígono Sol natal'],
  Uranus:  ['Urano sextil Luna natal', 'Urano · casa 11', 'Tránsito Urano · casa 6'],
  Pluto:   ['Plutón · casa 8', 'Plutón sextil Venus natal', 'Plutón trígono Sol natal'],
};

function buildSeedHistory(enneagramType: EnneagramType | null): Quote[] {
  const baseType: EnneagramType = enneagramType ?? 4;
  const history: Quote[] = [];

  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    // Siempre usar las frases del tipo real del usuario.
    // Rotar entre los placeholders disponibles para ese tipo.
    const typeQuotes = PLACEHOLDER_QUOTES[baseType];
    const placeholder = typeQuotes[i % typeQuotes.length];

    const planet = SEED_PLANETS[i % SEED_PLANETS.length];
    const contexts = SEED_CONTEXTS[planet];
    const context = contexts[i % contexts.length];

    history.push({
      id: `quote-${dateStr}`,
      text: placeholder.text,
      explanation: placeholder.explanation,
      date: dateStr,
      isFavorite: i % 4 === 0,
      planetaryContext: context,
      dominantPlanet: planet,
      enneagramType: baseType,
    });
  }

  return history;
}

interface QuoteState {
  todayQuote: Quote | null;
  history: Quote[];   // all quotes, most recent first; today is at index 0 once set
  isHistorySeeded: boolean;

  setTodayQuote: (quote: Quote) => void;
  seedHistory: (enneagramType: EnneagramType | null) => void;
  toggleSave: (quoteId: string) => void;
}

export const useQuoteStore = create<QuoteState>((set, get) => ({
  todayQuote: null,
  history: [],
  isHistorySeeded: false,

  setTodayQuote: (quote) => {
    // Operación atómica: actualiza todayQuote e history en un solo set.
    // Evita race conditions entre dos llamadas set() separadas.
    set((state) => {
      const idx = state.history.findIndex((q) => q.id === quote.id);
      if (idx === -1) {
        // No estaba en history → añadir al principio
        return { todayQuote: quote, history: [quote, ...state.history] };
      }
      // Ya estaba → actualizar el texto/contenido pero respetar isFavorite guardado
      const updated = state.history.map((q) =>
        q.id === quote.id ? { ...quote, isFavorite: q.isFavorite } : q
      );
      return { todayQuote: { ...quote, isFavorite: state.history[idx].isFavorite }, history: updated };
    });
  },

  seedHistory: (enneagramType) => {
    if (get().isHistorySeeded) return;
    const seeds = buildSeedHistory(enneagramType);
    const { history } = get();
    // Append seeds that aren't already in history
    const existingIds = new Set(history.map((q) => q.id));
    const newEntries = seeds.filter((q) => !existingIds.has(q.id));
    set({ history: [...history, ...newEntries], isHistorySeeded: true });
  },

  toggleSave: (quoteId) => {
    set((state) => {
      // Determinar el nuevo valor de isFavorite
      const currentFavorite =
        state.history.find((q) => q.id === quoteId)?.isFavorite ??
        (state.todayQuote?.id === quoteId ? state.todayQuote.isFavorite : false);
      const newFavorite = !currentFavorite;

      // Si la quote no está en history (edge case), añadirla desde todayQuote
      const inHistory = state.history.some((q) => q.id === quoteId);
      const baseHistory =
        !inHistory && state.todayQuote?.id === quoteId
          ? [state.todayQuote, ...state.history]
          : state.history;

      const history = baseHistory.map((q) =>
        q.id === quoteId ? { ...q, isFavorite: newFavorite } : q
      );
      const todayQuote =
        state.todayQuote?.id === quoteId
          ? { ...state.todayQuote, isFavorite: newFavorite }
          : state.todayQuote;

      return { history, todayQuote };
    });
  },
}));
