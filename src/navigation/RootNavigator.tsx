import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNavigator } from '@/navigation/OnboardingNavigator';
import { MainNavigator } from '@/navigation/MainNavigator';
import { RootStackParamList } from '@/navigation/types';
import { useAppReady } from '@/hooks/useAppReady';

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

  // ── Navegación según estado ───────────────────────────────────────────────
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'fade' }}
      initialRouteName={route === 'main' ? 'Main' : 'Onboarding'}
    >
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
