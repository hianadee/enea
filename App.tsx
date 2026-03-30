import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <OnboardingNavigator />
    </NavigationContainer>
  );
}
