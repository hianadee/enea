import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BirthDataScreen } from '../screens/onboarding/BirthDataScreen';
import { EnneagramIntroScreen } from '../screens/onboarding/EnneagramIntroScreen';
import { EnneagramTestScreen } from '../screens/onboarding/EnneagramTestScreen';
import { EnneagramResultScreen } from '../screens/onboarding/EnneagramResultScreen';
import { TonePreferencesScreen } from '../screens/onboarding/TonePreferencesScreen';
import { OnboardingCompleteScreen } from '../screens/onboarding/OnboardingCompleteScreen';
import { OnboardingStackParamList } from './types';

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
      <Stack.Screen name="Birth" component={BirthDataScreen} />
      <Stack.Screen name="EnneagramIntro" component={EnneagramIntroScreen} />
      <Stack.Screen name="EnneagramTest" component={EnneagramTestScreen} />
      <Stack.Screen name="EnneagramResult" component={EnneagramResultScreen} />
      <Stack.Screen name="TonePreferences" component={TonePreferencesScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </Stack.Navigator>
  );
};
