import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNavigator } from '@/navigation/OnboardingNavigator';
import { MainNavigator } from '@/navigation/MainNavigator';
import { RootStackParamList } from '@/navigation/types';
import { useAppReady } from '@/hooks/useAppReady';

// Solo en desarrollo: pantallas sandbox
import { DevPreviewScreen }        from '@/screens/dev/DevPreviewScreen';
import { TypographyPreviewScreen } from '@/screens/dev/TypographyPreviewScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const route = useAppReady();

  // ── Splash mientras cargamos sesión + perfil ──────────────────────────────
  if (route === 'loading') {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  // ── En __DEV__ arrancamos siempre en DevPreview ───────────────────────────
  const initialRoute: keyof RootStackParamList = __DEV__
    ? 'DevPreview'
    : route === 'main'
    ? 'Main'
    : 'Onboarding';

  // ── Navegación según estado ───────────────────────────────────────────────
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'fade' }}
      initialRouteName={initialRoute}
    >
      {__DEV__ && (
        <Stack.Screen name="DevPreview"        component={DevPreviewScreen} />
      )}
      {__DEV__ && (
        <Stack.Screen name="TypographyPreview" component={TypographyPreviewScreen} />
      )}
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="Main"       component={MainNavigator} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
