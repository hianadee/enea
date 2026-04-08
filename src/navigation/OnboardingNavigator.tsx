import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IntroScreen } from '@/screens/onboarding/IntroScreen';
import { FirstNameScreen } from '@/screens/onboarding/FirstNameScreen';
import { BirthDateScreen } from '@/screens/onboarding/BirthDateScreen';
import { BirthPlaceScreen } from '@/screens/onboarding/BirthPlaceScreen';
import { BirthTimeScreen } from '@/screens/onboarding/BirthTimeScreen';
import { NatalChartPreviewScreen } from '@/screens/onboarding/NatalChartPreviewScreen';
import { NumerologyScreen } from '@/screens/onboarding/NumerologyScreen';
import { EnneagramIntroScreen } from '@/screens/onboarding/EnneagramIntroScreen';
import { EnneagramTestScreen } from '@/screens/onboarding/EnneagramTestScreen';
import { EnneagramResultScreen } from '@/screens/onboarding/EnneagramResultScreen';
import { ReligionScreen } from '@/screens/onboarding/ReligionScreen';
import { ReligionTypeScreen } from '@/screens/onboarding/ReligionTypeScreen';
import { TonePreferencesScreen } from '@/screens/onboarding/TonePreferencesScreen';
import { WelcomeScreen } from '@/screens/onboarding/WelcomeScreen';
import { OnboardingCompleteScreen } from '@/screens/onboarding/OnboardingCompleteScreen';
import { OnboardingStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0A0A0F' },
      }}
    >
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="FirstName" component={FirstNameScreen} />
      <Stack.Screen name="BirthDate" component={BirthDateScreen} />
      <Stack.Screen name="BirthPlace" component={BirthPlaceScreen} />
      <Stack.Screen name="BirthTime" component={BirthTimeScreen} />
      <Stack.Screen name="NatalChartPreview" component={NatalChartPreviewScreen} />
      <Stack.Screen name="Numerology" component={NumerologyScreen} />
      <Stack.Screen name="EnneagramIntro" component={EnneagramIntroScreen} />
      <Stack.Screen name="EnneagramTest" component={EnneagramTestScreen} />
      <Stack.Screen name="EnneagramResult" component={EnneagramResultScreen} />
      <Stack.Screen name="Religion" component={ReligionScreen} />
      <Stack.Screen name="ReligionType" component={ReligionTypeScreen} />
      <Stack.Screen name="TonePreferences" component={TonePreferencesScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </Stack.Navigator>
  );
};
