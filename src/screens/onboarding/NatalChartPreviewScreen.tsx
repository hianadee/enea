import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NatalChartWheel } from '@/design-system/components/NatalChartWheel';
import { useOnboardingStore } from '@/store/onboardingStore';
import { PLANET_PALETTES, FONT_FAMILY, TYPOGRAPHY } from '@/constants/theme';
import { OnboardingStackParamList } from '@/navigation/types';
import { calculateFullNatalChart, signNameEs, ZODIAC_SIGNS } from '@/utils/astroUtils';
import { NatalChart } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'NatalChartPreview'>;
};

const TOTAL  = 10;
const ACCENT = '#FC8181';

export const NatalChartPreviewScreen: React.FC<Props> = ({ navigation }) => {
  const { birthData, setNatalChart, setStep } = useOnboardingStore();
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!birthData.date || !birthData.time) {
        setError('Datos de nacimiento incompletos.');
        return;
      }
      const lat = birthData.latitude ?? 0;
      const lng = birthData.longitude ?? 0;
      const computed = calculateFullNatalChart(birthData.date, birthData.time, lat, lng);
      setChart(computed);
      setNatalChart(computed);
    } catch {
      setError('No se pudo calcular la carta natal.');
    }
  }, []);

  const handleContinue = () => {
    setStep('numerology');
    navigation.navigate('Numerology');
  };

  const birthSummary = useMemo(() => {
    if (!birthData.date) return '';
    const [year, month, day] = birthData.date.split('-');
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    const mName = monthNames[parseInt(month, 10) - 1] ?? month;
    const parts = [`${parseInt(day, 10)} de ${mName} de ${year}`];
    if (birthData.time) parts.push(birthData.time + 'h');
    if (birthData.locationName) parts.push(birthData.locationName);
    return parts.join(' • ');
  }, [birthData]);

  const sun  = chart?.planets?.find(p => p.name === 'Sun');
  const moon = chart?.planets?.find(p => p.name === 'Moon');
  const asc  = chart ? signFromLon(chart.ascendantLon) : null;

  const isLoading = !chart && !error;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Volver a la pantalla anterior"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepCounter}>5 de {TOTAL}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              color="#555555"
              size="large"
              accessibilityLabel="Calculando carta natal"
            />
            <Text
              style={styles.loadingHeading}
              accessibilityLiveRegion="polite"
            >
              Calculando los astros{'\n'}en el momento de tu llegada…
            </Text>
            <Text style={styles.loadingSubtext}>{birthSummary}</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Pre-título */}
            <Text style={styles.preTitle}>TUS ASTROS</Text>

            {/* Título principal */}
            <Text style={styles.heading}>Tu carta natal</Text>

            {/* Fecha · hora · lugar en coral, pegado al título */}
            {birthSummary ? (
              <Text style={styles.birthSummary}>{birthSummary}</Text>
            ) : null}

            {/* Texto introductorio — 32px de distancia */}
            <View style={styles.introBlock}>
              <Text style={styles.introParagraph}>
                El cielo exacto del momento en que naciste.
              </Text>
              <Text style={styles.introParagraph}>
                Sol, Luna y Ascendente — los tres puntos que más te definen.
              </Text>
              <Text style={styles.introParagraph}>
                Sus movimientos actuales activan ese mapa: marcan tus momentos.
              </Text>
            </View>

            {/* Chart wheel */}
            <View style={styles.wheelContainer}>
              <NatalChartWheel
                birthData={birthData}
                natalChart={chart}
                size={300}
              />
            </View>

            {/* Big three */}
            {chart && (
              <View style={styles.bigThreeRow}>
                <BigThreeItem
                  glyph="☉"
                  label="Sol"
                  description="Tu esencia, lo que te mueve"
                  signEs={signNameEs(chart.sunSign)}
                  signSymbol={ZODIAC_SIGNS.find(z => z.name === chart.sunSign)?.symbol ?? ''}
                  color={PLANET_PALETTES.Sun.primary}
                  degrees={sun?.degreesInSign}
                  minutes={sun?.minutesInSign}
                />
                <View style={styles.divider} />
                <BigThreeItem
                  glyph="☽"
                  label="Luna"
                  description="Tu mundo emocional"
                  signEs={signNameEs(chart.moonSign)}
                  signSymbol={ZODIAC_SIGNS.find(z => z.name === chart.moonSign)?.symbol ?? ''}
                  color={PLANET_PALETTES.Moon.primary}
                  degrees={moon?.degreesInSign}
                  minutes={moon?.minutesInSign}
                />
                <View style={styles.divider} />
                <BigThreeItem
                  glyph="↑"
                  label="Ascendente"
                  description="Cómo te perciben los demás"
                  signEs={signNameEs(chart.risingSign)}
                  signSymbol={ZODIAC_SIGNS.find(z => z.name === chart.risingSign)?.symbol ?? ''}
                  color="#FFFFFF"
                  degrees={asc?.degrees}
                  minutes={asc?.minutes}
                />
              </View>
            )}

            {/* Planet list */}
            {chart && (
              <View style={styles.planetList}>
                <Text style={styles.planetListTitle}>Posiciones planetarias</Text>
                {chart.planets
                  .filter(p => p.name !== 'NorthNode')
                  .map(p => (
                    <View key={p.name} style={styles.planetRow}>
                      <Text style={[styles.planetSymbol, { color: p.color }]}>{p.symbol}</Text>
                      <Text style={styles.planetName}>{planetEs(p.name)}</Text>
                      <Text style={styles.planetPos}>
                        {p.degreesInSign}°{String(p.minutesInSign).padStart(2, '0')}'
                      </Text>
                      <Text style={[styles.planetSign, { color: p.color }]}>
                        {signNameEs(p.sign)}
                      </Text>
                    </View>
                  ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      {!isLoading && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.ctaBtn, !chart && styles.ctaBtnDisabled]}
            onPress={handleContinue}
            disabled={!chart}
            activeOpacity={0.85}
            accessibilityLabel="Continuar al siguiente paso"
            accessibilityRole="button"
            accessibilityState={{ disabled: !chart }}
          >
            <Text style={styles.ctaBtnText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

interface BigThreeItemProps {
  glyph: string;
  label: string;
  description: string;
  signEs: string;
  signSymbol: string;
  color: string;
  degrees?: number;
  minutes?: number;
}

const BigThreeItem: React.FC<BigThreeItemProps> = ({
  glyph, label, description, signEs, signSymbol, color, degrees, minutes,
}) => (
  <View style={bigThreeStyles.item}>
    <Text style={[bigThreeStyles.glyph, { color }]}>{glyph}</Text>
    <Text style={bigThreeStyles.label}>{label}</Text>
    <Text style={bigThreeStyles.description}>{description}</Text>
    <View style={bigThreeStyles.signRow}>
      <Text style={bigThreeStyles.signSymbol}>{signSymbol}</Text>
      <Text style={bigThreeStyles.sign}>{signEs}</Text>
    </View>
    {degrees !== undefined && (
      <Text style={bigThreeStyles.deg}>
        {degrees}°{String(minutes ?? 0).padStart(2, '0')}'
      </Text>
    )}
  </View>
);

const bigThreeStyles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },

  // Nivel 1 — símbolo del planeta (decorativo, grande)
  glyph: { fontSize: 24, marginBottom: 10 },

  // Nivel 2 — categoría (SOL / LUNA / ASCENDENTE)
  label: {
    ...TYPOGRAPHY.presets.label,
    color: '#8B8A9E',
    textAlign: 'center',
    marginBottom: 6,
  },

  // Nivel 3 — contexto breve (muted, caption)
  description: {
    ...TYPOGRAPHY.presets.caption,
    color: '#7D7C8F',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },

  // Nivel 4 — EL DATO: nombre del signo (hero de cada columna)
  signRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 },
  signSymbol: { fontSize: 13, color: '#8B8A9E' },
  sign: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 17,
    fontWeight: '400',
    color: '#F0EEF6',
  },

  // Nivel 5 — grados (técnico, secundario)
  deg: { fontSize: 12, color: '#7D7C8F', letterSpacing: 0.3 },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function signFromLon(lon: number) {
  const normalized = ((lon % 360) + 360) % 360;
  const idx = Math.floor(normalized / 30);
  const raw = normalized - idx * 30;
  return { degrees: Math.floor(raw), minutes: Math.floor((raw % 1) * 60) };
}

function planetEs(name: string): string {
  const map: Record<string, string> = {
    Sun: 'Sol', Moon: 'Luna', Mercury: 'Mercurio', Venus: 'Venus',
    Mars: 'Marte', Jupiter: 'Júpiter', Saturn: 'Saturno',
    Uranus: 'Urano', Neptune: 'Neptuno', Pluto: 'Plutón', NorthNode: 'Nodo Norte',
  };
  return map[name] ?? name;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backBtn: { width: 40, height: 44, justifyContent: 'center' },
  backArrow: { color: '#F0EEF6', fontSize: 22 },
  headerSpacer: { width: 40 },
  stepCounter: {
    flex: 1,
    textAlign: 'center',
    color: '#8B8A9E',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 24,
  },
  loadingHeading: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 26,
    color: '#F0EEF6',
    lineHeight: 36,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#8B8A9E',
    textAlign: 'center',
  },
  errorText: { color: '#666666', fontSize: 14, textAlign: 'center' },
  // ── Encabezado de sección ─────────────────────────────────────────────────
  preTitle: {
    fontSize: 11,
    color: '#8B8A9E',
    letterSpacing: 2,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 8,
  },
  heading: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 36,
    color: '#F0EEF6',
    fontWeight: '300',
    letterSpacing: -0.3,
    alignSelf: 'flex-start',
    marginBottom: 8,
    lineHeight: 42,
  },

  // ── Fecha en coral, vinculada al título ───────────────────────────────────
  birthSummary: {
    fontSize: 14,
    color: ACCENT,
    alignSelf: 'flex-start',
    lineHeight: 21,
    letterSpacing: 0.1,
  },

  // ── Bloque de texto introductorio — 32px del birth summary ────────────────
  introBlock: {
    alignSelf: 'stretch',
    marginTop: 24,
    marginBottom: 28,
    gap: 12,
  },
  introParagraph: {
    ...TYPOGRAPHY.presets.bodyLg,
    color: '#8B8A9E',
  },
  wheelContainer: {
    width: 300,
    height: 300,
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigThreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#111118',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2A2A3A',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 4,
    marginBottom: 32,
    width: '100%',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: '#2A2A3A',
    marginVertical: 4,
  },
  planetList: {
    width: '100%',
    marginBottom: 16,
  },
  planetListTitle: {
    ...TYPOGRAPHY.presets.label,
    color: '#8B8A9E',
    marginBottom: 14,
  },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1C1C26',
  },
  // Col 1 — símbolo del planeta (colored)
  planetSymbol: { fontSize: 16, width: 28, textAlign: 'center' },
  // Col 2 — nombre (dato principal → color text)
  planetName: { flex: 1, ...TYPOGRAPHY.presets.body, color: '#F0EEF6' },
  // Col 3 — grados (secundario → muted, monoespaciado visual)
  planetPos: { ...TYPOGRAPHY.presets.caption, color: '#7D7C8F', width: 52, textAlign: 'right', marginRight: 12 },
  // Col 4 — signo (accent del planeta)
  planetSign: { ...TYPOGRAPHY.presets.bodySm, fontWeight: '500', width: 68, textAlign: 'right' },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  ctaBtn: {
    backgroundColor: '#F0EEF6',
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnDisabled: { opacity: 0.3 },
  ctaBtnText: { color: '#1A2332', fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
});
