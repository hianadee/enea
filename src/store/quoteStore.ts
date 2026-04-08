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

    // Rotate nearby types for textual variety
    const typeIndex = ((baseType - 1 + i) % 9) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    const quoteType = (typeIndex + 1) as EnneagramType;
    const typeQuotes = PLACEHOLDER_QUOTES[quoteType];
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
      enneagramType: quoteType,
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
    set({ todayQuote: quote });
    // Prepend today to history if not already present
    const { history } = get();
    if (!history.find((q) => q.id === quote.id)) {
      set({ history: [quote, ...history] });
    }
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
      const history = state.history.map((q) =>
        q.id === quoteId ? { ...q, isFavorite: !q.isFavorite } : q
      );
      const todayQuote =
        state.todayQuote?.id === quoteId
          ? { ...state.todayQuote, isFavorite: !state.todayQuote.isFavorite }
          : state.todayQuote;
      return { history, todayQuote };
    });
  },
}));
