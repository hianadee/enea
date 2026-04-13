import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PostHogProvider } from 'posthog-react-native';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { navigationRef } from '@/navigation/navigationRef';

const POSTHOG_KEY  = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

export default function App() {
  return (
    <PostHogProvider apiKey={POSTHOG_KEY} options={{ host: POSTHOG_HOST }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <NavigationContainer ref={navigationRef}>
                <StatusBar style="light" />
                <RootNavigator />
              </NavigationContainer>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PostHogProvider>
  );
}
