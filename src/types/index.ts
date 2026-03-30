export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SpiritualTradition =
  | 'Buddhist'
  | 'Stoic'
  | 'Christian'
  | 'Hindu'
  | 'Secular'
  | 'Taoist'
  | 'Islamic'
  | 'Jewish';

export type LanguageStyle = 'Poetic' | 'Direct' | 'Metaphorical' | 'Scientific';

export type EnergyType = 'Grounding' | 'Motivating' | 'Reflective' | 'Uplifting';

export type LifeFocus = 'Career' | 'Relationships' | 'Inner growth' | 'Health' | 'Creativity';

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

export interface NatalChart {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  dominantPlanet: DominantPlanet;
  aspects: string[];
  rawData: Record<string, unknown>;
}

export interface BirthData {
  date: string; // ISO date string
  time: string; // HH:MM
  latitude: number;
  longitude: number;
  locationName: string;
}

export interface TonePreferences {
  spiritualTradition: SpiritualTradition;
  languageStyle: LanguageStyle;
  energy: EnergyType;
  lifeFocus: LifeFocus;
}

export interface UserProfile {
  id: string;
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
}

export interface EnneagramQuestion {
  id: number;
  text: string;
  options: {
    label: string;
    types: EnneagramType[];
  }[];
}

export type OnboardingStep =
  | 'birth'
  | 'enneagram_intro'
  | 'enneagram_test'
  | 'enneagram_result'
  | 'tone'
  | 'complete';
