/**
 * DevPreviewScreen — solo visible en __DEV__
 * Sandbox para previsualizar cualquier pantalla sin pasar por el onboarding.
 * En producción este archivo nunca se incluye en el bundle.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUserStore } from '@/store/userStore';
import { FONT_FAMILY } from '@/constants/theme';

// ─── Mock data — simula un usuario que completó el onboarding ─────────────────

function injectMockProfile() {
  const ob = useOnboardingStore.getState();
  const us = useUserStore.getState();

  ob.setFirstName('Ana');
  ob.setFullName('Ana Martínez');
  ob.setBirthData({
    date:         '1990-03-15',
    time:         '14:30',
    latitude:     40.4168,
    longitude:    -3.7038,
    locationName: 'Madrid, España',
  });
  ob.setEnneagramType(4);
  ob.setReligionResponse('espiritual');
  ob.setTonePreference('languageStyle',      'Poético');
  ob.setTonePreference('energy',             'Reflexivo');
  ob.setTonePreference('lifeFocus',          'Crecimiento interior');
  ob.setTonePreference('spiritualTradition', 'Budista');
  ob.setStep('complete');
  us.setOnboardingCompleted(true);
}

// ─── Definición de pantallas ──────────────────────────────────────────────────

type ScreenEntry = {
  label: string;
  emoji: string;
  action: (nav: ReturnType<typeof useNavigation<any>>) => void;
};

type Section = {
  title: string;
  color: string;
  screens: ScreenEntry[];
};

const SECTIONS: Section[] = [
  {
    title: 'Onboarding',
    color: '#A78BFA',
    screens: [
      { label: 'Intro',              emoji: '🌑', action: (n) => n.dispatch(CommonActions.navigate('Onboarding', { screen: 'Intro' })) },
      { label: 'Nombre',             emoji: '👤', action: (n) => n.dispatch(CommonActions.navigate('Onboarding', { screen: 'FirstName' })) },
      { label: 'Fecha de nacimiento',emoji: '📅', action: (n) => n.dispatch(CommonActions.navigate('Onboarding', { screen: 'BirthDate' })) },
      { label: 'Lugar de nacimiento',emoji: '📍', action: (n) => n.dispatch(CommonActions.navigate('Onboarding', { screen: 'BirthPlace' })) },
      { label: 'Hora de nacimiento', emoji: '⏰', action: (n) => n.dispatch(CommonActions.navigate('Onboarding', { screen: 'BirthTime' })) },
      { label: 'Carta natal',        emoji: '🔮', action: (n) => { injectMockProfile(); n.dispatch(CommonActions.navigate('Onboarding', { screen: 'NatalChartPreview' })); } },
      { label: 'Numerología',        emoji: '🔢', action: (n) => { injectMockProfile(); n.dispatch(CommonActions.navigate('Onboarding', { screen: 'Numerology' })); } },
      { label: 'Eneagrama Intro',    emoji: '🧠', action: (n) => n.dispatch(CommonActions.navigate('Onboarding', { screen: 'EnneagramIntro' })) },
      { label: 'Test Eneagrama',     emoji: '✍️', action: (n) => n.dispatch(CommonActions.navigate('Onboarding', { screen: 'EnneagramTest' })) },
      { label: 'Religión',           emoji: '🕊️', action: (n) => n.dispatch(CommonActions.navigate('Onboarding', { screen: 'Religion' })) },
      { label: 'Tono de voz',        emoji: '🎨', action: (n) => n.dispatch(CommonActions.navigate('Onboarding', { screen: 'TonePreferences' })) },
      { label: 'Bienvenida',         emoji: '✨', action: (n) => { injectMockProfile(); n.dispatch(CommonActions.navigate('Onboarding', { screen: 'Welcome' })); } },
    ],
  },
  {
    title: 'Design System',
    color: '#67E8F9',
    screens: [
      { label: 'Tipografía\nColores\nSpacing', emoji: '🎨', action: (n) => n.navigate('TypographyPreview') },
    ],
  },
  {
    title: 'App principal',
    color: '#FC8181',
    screens: [
      { label: 'Frase del día',      emoji: '☀️', action: (n) => { injectMockProfile(); n.dispatch(CommonActions.navigate('Main')); } },
      { label: 'Diario',             emoji: '📓', action: (n) => { injectMockProfile(); n.dispatch(CommonActions.navigate('Main')); } },
      { label: 'Ajustes',            emoji: '⚙️', action: (n) => { injectMockProfile(); n.dispatch(CommonActions.navigate('Main')); } },
    ],
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export const DevPreviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.badge}>
          <Text style={s.badgeText}>DEV</Text>
        </View>
        <Text style={s.title}>Vista previa</Text>
        <Text style={s.subtitle}>Toca una pantalla para abrirla directamente</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <View key={section.title} style={s.section}>

            {/* Título de sección */}
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: section.color }]} />
              <Text style={[s.sectionTitle, { color: section.color }]}>
                {section.title.toUpperCase()}
              </Text>
            </View>

            {/* Grid de pantallas */}
            <View style={s.grid}>
              {section.screens.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={s.card}
                  onPress={() => item.action(navigation)}
                  activeOpacity={0.7}
                >
                  <Text style={s.cardEmoji}>{item.emoji}</Text>
                  <Text style={s.cardLabel} numberOfLines={2}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

          </View>
        ))}

        {/* Nota informativa */}
        <View style={s.note}>
          <Text style={s.noteText}>
            🔒 Esta pantalla solo aparece en modo desarrollo.{'\n'}
            No se incluye en el build de producción.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08080D',
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1E1E2A',
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FC8181' + '22',
    borderWidth: 1,
    borderColor: '#FC8181' + '55',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FC8181',
    letterSpacing: 2,
  },
  title: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#666680',
    lineHeight: 20,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 32,
  },

  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#111118',
    borderWidth: 1,
    borderColor: '#1E1E2A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 6,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardLabel: {
    fontSize: 11,
    color: '#AAAACC',
    textAlign: 'center',
    lineHeight: 15,
  },

  note: {
    backgroundColor: '#111118',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E1E2A',
  },
  noteText: {
    fontSize: 12,
    color: '#555570',
    lineHeight: 19,
    textAlign: 'center',
  },
});
