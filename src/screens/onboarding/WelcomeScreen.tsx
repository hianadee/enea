import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/design-system/tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useOnboardingSave } from '@/hooks/useOnboardingSave';
import { RootStackParamList } from '@/navigation/types';

export const WelcomeScreen: React.FC = () => {
  const { firstName } = useOnboardingStore();
  const { saveAnonymous } = useOnboardingSave();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleContinue = async () => {
    try { await saveAnonymous(); } catch { /* continuar igualmente */ }
    rootNav.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const greeting = firstName ? `Hola, ${firstName}.` : 'Hola.';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Animated.Text
          style={[styles.heading, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {greeting}
        </Animated.Text>

        <Animated.Text
          style={[styles.subtitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          Ya tengo lo que necesito para acompañarte. Cada día recibirás una reflexión pensada para ti: quién eres, cómo te sientes hoy, y qué puedes hacer con eso.
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
          accessibilityLabel="Ver mi reflexión de hoy"
          accessibilityRole="button"
        >
          <Text style={styles.ctaBtnText}>Ver mi reflexión de hoy</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 24,
  },
  heading: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 40,
    color: colors.fg.primary,
    fontWeight: '300',
    lineHeight: 50,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#A8A8B8',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  ctaBtn: {
    backgroundColor: colors.fg.primary,
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    color: colors.bg.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
