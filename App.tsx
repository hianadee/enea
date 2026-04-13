import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PostHogProvider } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { navigationRef } from '@/navigation/navigationRef';

const POSTHOG_KEY  = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

Sentry.init({
  dsn: 'https://a4040ee94d77fe0f5cd17ce210015efc@o4511213984022528.ingest.de.sentry.io/4511213991755856',
  tracesSampleRate: 0.2,
  environment: __DEV__ ? 'development' : 'production',
});

function App() {
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

export default Sentry.wrap(App);
