export type OnboardingStackParamList = {
  Intro: undefined;
  FirstName: undefined;
  BirthDate: undefined;
  BirthPlace: undefined;
  BirthTime: undefined;
  NatalChartPreview: undefined;
  Numerology: undefined;
  EnneagramIntro: undefined;
  EnneagramTest: undefined;
  EnneagramResult: undefined;
  Religion: undefined;
  ReligionType: undefined;
  TonePreferences: undefined;
  Welcome: undefined;
  OnboardingComplete: undefined;
};

export type TabParamList = {
  Today: undefined;
  Journal: undefined;
  Settings: { scrollTo?: 'avisos' } | undefined;
};

export type MainStackParamList = {
  Tabs:        undefined;
  QuoteDetail: { quoteId: string };
  Paywall:     undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  DevPreview: undefined;
  TypographyPreview: undefined;
};
