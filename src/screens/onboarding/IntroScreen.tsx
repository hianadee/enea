import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVideoPlayer, VideoView } from 'expo-video';
import { usePostHog } from 'posthog-react-native';
import { colors } from '@/design-system/tokens';
import { OnboardingStackParamList } from '@/navigation/types';

const { width: SCREEN_W } = Dimensions.get('window');
const LOGO_W = Math.min(SCREEN_W * 0.55, 260);
const LOGO_H = LOGO_W * 1.207; // aspect ratio real de enea_logo.png (600×724 → h/w = 1.207)

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Intro'>;
};

export const IntroScreen: React.FC<Props> = ({ navigation }) => {
  const posthog = usePostHog();
  const [videoReady, setVideoReady] = useState(false);

  const handleStart = () => {
    posthog?.capture('onboarding_start');
    navigation.navigate('FirstName');
  };

  const player = useVideoPlayer(require('../../../assets/videos/stars.mp4'), p => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    const subscription = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'readyToPlay') setVideoReady(true);
      if (status === 'error' || error) setVideoReady(false);
    });
    return () => subscription.remove();
  }, [player]);

  return (
    <View style={styles.container}>
      {videoReady && (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        />
      )}
      <View
        style={styles.overlay}
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
      />

      <SafeAreaView style={styles.safe}>
        {/* Upper half — logo hero */}
        <View style={styles.logoArea}>
          <Image
            source={require('../../../assets/enea_logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo de Enea"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.55)',
  },
  safe: {
    flex: 1,
  },
  logoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_W,
    height: LOGO_H,
  },
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
