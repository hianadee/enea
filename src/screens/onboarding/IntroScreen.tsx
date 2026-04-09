import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '@/design-system/tokens';
import { OnboardingStackParamList } from '@/navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Intro'>;
};

export const IntroScreen: React.FC<Props> = ({ navigation }) => {
  const handleStart = () => navigation.navigate('FirstName');

  const player = useVideoPlayer(require('../../../assets/videos/stars.mp4'), p => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      <View style={styles.overlay} />

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
    width: 280,
    height: 280,
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
