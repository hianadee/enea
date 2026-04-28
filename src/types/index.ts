export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SpiritualTradition =
  | 'Budista'
  | 'Estoica'
  | 'Cristiana'
  | 'Hindú'
  | 'Secular'
  | 'Taoísta'
  | 'Islámica'
  | 'Judía';

export type GenderPreference = 'femenino' | 'masculino' | 'neutro';

export type LanguageStyle = 'Poético' | 'Directo' | 'Metafórico' | 'Científico';

export type EnergyType = 'Centrador' | 'Motivador' | 'Reflexivo' | 'Elevador';

export type LifeFocus = 'Carrera' | 'Relaciones' | 'Crecimiento interior' | 'Salud' | 'Creatividad';

export type DominantPlanet =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto';

export interface PlanetPosition {
  name: string;
  symbol: string;
  eclipticLon: number;    // 0–360 degrees (tropical, of date)
  sign: string;
  signSymbol: string;
  signIndex: number;      // 0–11 (Aries = 0)
  degreesInSign: number;  // 0–29
  minutesInSign: number;  // 0–59
  color: string;
  isRetrograde?: boolean;
}

export interface ChartAspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;
  color: string;
}

export interface NatalChart {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  dominantPlanet: DominantPlanet;
  aspects: string[];
  rawData: Record<string, unknown>;
  // Full chart data
  planets: PlanetPosition[];
  chartAspects: ChartAspect[];
  ascendantLon: number;
  mcLon: number;
  houseCusps: number[];
}

export interface BirthData {
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:MM
  latitude: number;
  longitude: number;
  locationName: string;
}

export interface TonePreferences {
  languageStyle: LanguageStyle;
  energy: EnergyType;
  lifeFocus: LifeFocus;
  spiritualTradition?: SpiritualTradition;
}

export interface UserProfile {
  id: string;
  firstName: string;
  fullName: string;
  birthData: BirthData;
  natalChart: NatalChart | null;
  enneagramType: EnneagramType | null;
  tonePreferences: TonePreferences;
  createdAt: string;
}

export interface Quote {
  id: string;
  text: string;
  explanation: string;
  date: string;
  isFavorite: boolean;
  planetaryContext?: string;
  dominantPlanet?: DominantPlanet;
  enneagramType?: EnneagramType;
  /** true = fallback local, no guardar en Supabase, reintentar en próxima carga */
  isPlaceholder?: boolean;
}

export interface EnneagramQuestion {
  id: number;
  text: string;
  options: {
    label: string;
    types: EnneagramType[];
  }[];
}

export type ReligionResponse = 'si' | 'no' | 'espiritual';

// ─── Numerología ──────────────────────────────────────────────────────────────

export interface NumerologyProfile {
  lifePath: number;      // 1–9 (o 11, 22, 33 — números maestros)
  dayNumber: number;     // 1–9
  personalYear: number;  // 1–9
  universalDay: number;  // varía cada día
}

export type OnboardingStep =
  | 'first_name'
  | 'birth_date'
  | 'birth_place'
  | 'birth_time'
  | 'natal_chart'
  | 'numerology'
  | 'enneagram_intro'
  | 'enneagram_test'
  | 'enneagram_result'
  | 'religion'
  | 'religion_type'
  | 'tone'
  | 'complete';
