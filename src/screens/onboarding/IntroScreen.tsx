import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { colors, typography, spacing } from '@/design-system/tokens';
import { Button, Card, Input } from '@/design-system/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Intro'>;
};

export const IntroScreen: React.FC<Props> = ({ navigation }) => {
  const handleStart = () => navigation.navigate('FirstName');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Upper half — logo hero */}
      <View style={styles.logoArea}>
        <Image
          source={require('../../../assets/enea_logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo de ENEA"
          accessibilityRole="image"
        />
      </View>

      {/* Lower half — copy + CTA */}
      <View style={styles.textArea}>
        <Text style={styles.headline}>
          Nada de lo que sientes es accidental
        </Text>
        <Text style={styles.subhead}>
          Conócete. Entiéndete. Cambia lo que quieras cambiar.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleStart}
          activeOpacity={0.85}
          accessibilityLabel="Quiero descubrirlo, comenzar la experiencia"
          accessibilityRole="button"
        >
          <Text style={styles.ctaBtnText}>Quiero descubrirlo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  // Top half — logo centered
  logoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 280,
    height: 280,
  },
  // Bottom section — text
  textArea: {
    paddingHorizontal: 28,
    paddingBottom: 36,
    gap: 16,
  },
  headline: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 34,
    color: colors.fg.primary,
    lineHeight: 44,
    fontWeight: '300',
    letterSpacing: -0.3,
  },
  subhead: {
    fontSize: 16,
    color: '#A8A8B8',
    lineHeight: 24,
    letterSpacing: 0.1,
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
