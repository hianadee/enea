import { create } from 'zustand';
import {
  BirthData,
  EnneagramType,
  GenderPreference,
  TonePreferences,
  NatalChart,
  NumerologyProfile,
  OnboardingStep,
  ReligionResponse,
  LanguageStyle,
  EnergyType,
  LifeFocus,
} from '@/types';

interface OnboardingState {
  step: OnboardingStep;
  firstName: string;
  fullName: string;
  genderPreference: GenderPreference;
  birthData: Partial<BirthData>;
  natalChart: NatalChart | null;
  numerologyProfile: NumerologyProfile | null;
  enneagramType: EnneagramType | null;
  religionResponse: ReligionResponse | null;
  religion: string | null;
  tonePreferences: Partial<TonePreferences>;

  setStep: (step: OnboardingStep) => void;
  setFirstName: (name: string) => void;
  setFullName: (name: string) => void;
  setGenderPreference: (gender: GenderPreference) => void;
  setBirthData: (data: Partial<BirthData>) => void;
  setNatalChart: (chart: NatalChart) => void;
  setNumerologyProfile: (profile: NumerologyProfile) => void;
  setEnneagramType: (type: EnneagramType) => void;
  setReligionResponse: (response: ReligionResponse) => void;
  setReligion: (religion: string) => void;
  setTonePreference: <K extends keyof TonePreferences>(key: K, value: TonePreferences[K]) => void;
  reset: () => void;
}

const initialState = {
  step: 'first_name' as OnboardingStep,
  firstName: '',
  fullName: '',
  genderPreference: 'neutro' as GenderPreference,
  birthData: {},
  natalChart: null,
  numerologyProfile: null,
  enneagramType: null,
  religionResponse: null,
  religion: null,
  tonePreferences: {},
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setFirstName: (firstName) => set({ firstName }),

  setFullName: (fullName) => set({ fullName }),

  setGenderPreference: (genderPreference) => set({ genderPreference }),

  setBirthData: (data) =>
    set((state) => ({ birthData: { ...state.birthData, ...data } })),

  setNatalChart: (chart) => set({ natalChart: chart }),

  setNumerologyProfile: (profile) => set({ numerologyProfile: profile }),

  setEnneagramType: (type) => set({ enneagramType: type }),

  setReligionResponse: (response) => set({ religionResponse: response }),

  setReligion: (religion) => set({ religion }),

  setTonePreference: (key, value) =>
    set((state) => ({
      tonePreferences: { ...state.tonePreferences, [key]: value },
    })),

  reset: () => set(initialState),
}));
