import { create } from 'zustand';
import {
  BirthData,
  EnneagramType,
  TonePreferences,
  NatalChart,
  OnboardingStep,
  SpiritualTradition,
  LanguageStyle,
  EnergyType,
  LifeFocus,
} from '../types';

interface OnboardingState {
  step: OnboardingStep;
  birthData: Partial<BirthData>;
  natalChart: NatalChart | null;
  enneagramType: EnneagramType | null;
  tonePreferences: Partial<TonePreferences>;

  setStep: (step: OnboardingStep) => void;
  setBirthData: (data: Partial<BirthData>) => void;
  setNatalChart: (chart: NatalChart) => void;
  setEnneagramType: (type: EnneagramType) => void;
  setTonePreference: <K extends keyof TonePreferences>(key: K, value: TonePreferences[K]) => void;
  reset: () => void;
}

const initialState = {
  step: 'birth' as OnboardingStep,
  birthData: {},
  natalChart: null,
  enneagramType: null,
  tonePreferences: {},
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setBirthData: (data) =>
    set((state) => ({ birthData: { ...state.birthData, ...data } })),

  setNatalChart: (chart) => set({ natalChart: chart }),

  setEnneagramType: (type) => set({ enneagramType: type }),

  setTonePreference: (key, value) =>
    set((state) => ({
      tonePreferences: { ...state.tonePreferences, [key]: value },
    })),

  reset: () => set(initialState),
}));
