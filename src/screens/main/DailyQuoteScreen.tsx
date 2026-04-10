import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useQuoteStore } from '@/store/quoteStore';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { TYPOGRAPHY, SPACING, PLANET_PALETTES, DEFAULT_PALETTE } from '@/constants/theme';
import { GeometryBackground } from '@/design-system/components/GeometryBackground';
import { EmailGateSheet } from '@/design-system/components/EmailGateSheet';
import { calculateUniversalDay, getDailyNumerologyPhrase } from '@/utils/numerologyUtils';
import { getSunSign, ZODIAC_SIGNS } from '@/utils/astroUtils';
import { generateDailyQuote } from '@/services/quoteGeneratorService';

const EMAIL_GATE_KEY = 'enea-email-gate-shown';

// ─── Dimensiones de la tarjeta de compartir (ratio 4:5) ──────────────────────
const CARD_W = Dimensions.get('window').width;
const CARD_H = Math.round(CARD_W * 1.25);

// Escala el texto según longitud: frases cortas grandes, largas pequeñas
function quotefontSize(text: string): number {
  const len = text.length;
  if (len <  60) return CARD_W * 0.094;
  if (len < 100) return CARD_W * 0.078;
  if (len < 140) return CARD_W * 0.065;
  if (len < 180) return CARD_W * 0.056;
  return CARD_W * 0.048;
}
function quoteLineHeight(fs: number): number { return fs * 1.38; }

// ─── Tipografía editorial ────────────────────────────────────────────────────
const GEORGIA = Platform.OS === 'ios' ? 'Georgia' : 'serif';

// ─── Ilustraciones zodiacales ─────────────────────────────────────────────────
// _b = arte blanco sobre fondo oscuro (dark mode)
// _w = arte negro sobre fondo claro  (light mode)
const ILLUSTRATIONS_DARK: Record<string, any> = {
  'Aries':       require('../../../assets/ilustraciones/aries_b.png'),
  'Tauro':       require('../../../assets/ilustraciones/tauro_b.png'),
  'Géminis':     require('../../../assets/ilustraciones/geminis_b.png'),
  'Cáncer':      require('../../../assets/ilustraciones/cancer_b.png'),
  'Leo':         require('../../../assets/ilustraciones/leo_b.png'),
  'Virgo':       require('../../../assets/ilustraciones/virgo_b.png'),
  'Libra':       require('../../../assets/ilustraciones/libra_b.png'),
  'Escorpio':    require('../../../assets/ilustraciones/escorpio_b.png'),
  'Sagitario':   require('../../../assets/ilustraciones/sagitario_b.png'),
  'Capricornio': require('../../../assets/ilustraciones/capricornio_b_01.png'),
  'Acuario':     require('../../../assets/ilustraciones/acuario_b.png'),
  'Piscis':      require('../../../assets/ilustraciones/piscis_b.png'),
};

const ILLUSTRATIONS_LIGHT: Record<string, any> = {
  'Aries':       require('../../../assets/ilustraciones/aries_w.png'),
  'Tauro':       require('../../../assets/ilustraciones/tauro_w.png'),
  'Géminis':     require('../../../assets/ilustraciones/geminis_w.png'),
  'Cáncer':      require('../../../assets/ilustraciones/cancer_w.png'),
  'Leo':         require('../../../assets/ilustraciones/leo_w.png'),
  'Virgo':       require('../../../assets/ilustraciones/virgo_w.png'),
  'Libra':       require('../../../assets/ilustraciones/libra_w.png'),
  'Escorpio':    require('../../../assets/ilustraciones/escorpio_w.png'),
  'Sagitario':   require('../../../assets/ilustraciones/sagitario_w.png'),
  'Capricornio': require('../../../assets/ilustraciones/capricornio_w.png'),
  'Acuario':     require('../../../assets/ilustraciones/acuario_w.png'),
  'Piscis':      require('../../../assets/ilustraciones/piscis_w.png'),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Logo ENEA (SVG inline) ───────────────────────────────────────────────────
const EneaLogo: React.FC<{ width: number; opacity?: number }> = ({ width, opacity = 0.55 }) => {
  const height = Math.round(width * (26 / 102));
  const fill   = `rgba(255,255,255,${opacity})`;
  return (
    <Svg width={width} height={height} viewBox="0 0 102 26" fill="none">
      <Path d="M81.1104 25.0939L91.3908 0H91.4448L101.725 25.0939H98.4603L95.6001 17.8895H87.1005L84.2134 25.0939H81.1104ZM88.1259 15.3261H94.5748L92.659 10.5232C92.4251 9.91163 92.2003 9.30901 91.9844 8.7154C91.7686 8.12178 91.5527 7.41123 91.3368 6.58377C91.121 7.41123 90.9141 8.12178 90.7162 8.7154C90.5184 9.29103 90.2935 9.89364 90.0417 10.5232L88.1259 15.3261Z" fill={fill} />
      <Path d="M59.2544 25.0991V0.814697H71.2348V3.56693H62.3304V8.74759H69.346V11.4998H62.3304V22.3468H71.2348V25.0991H59.2544Z" fill={fill} />
      <Path d="M44.6836 25.9033L27.6844 7.69005V25.0939H24.7703V0L41.7694 18.2133V0.809481H44.6836V25.9033Z" fill={fill} />
      <Path d="M0 25.0991V0.814697H11.9804V3.56693H3.07604V8.74759H10.0916V11.4998H3.07604V22.3468H11.9804V25.0991H0Z" fill={fill} />
    </Svg>
  );
};

// ─── ShareCard: tarjeta 4:5 para Instagram ───────────────────────────────────
interface ShareCardProps {
  quote:         string;
  date:          string;
  illustration?: any;
  sunSignEs?:    string | null;
}

const ShareCard = React.forwardRef<ViewShot, ShareCardProps>(
  ({ quote, date, illustration, sunSignEs }, ref) => {
    const fs = quotefontSize(quote);
    const lh = quoteLineHeight(fs);
    return (
      <ViewShot
        ref={ref}
        options={{ format: 'jpg', quality: 0.97 }}
        style={[card.container, { width: CARD_W, height: CARD_H }]}
      >
        {/* Fondo negro puro */}
        <View style={StyleSheet.absoluteFill} />

        {/* Frase — HERO con tamaño adaptativo */}
        <View style={card.quoteWrap}>
          <Text style={[card.quoteText, { fontSize: fs, lineHeight: lh }]}>
            {'\u201C'}{quote}{'\u201D'}
          </Text>
        </View>

        {/* Ilustración zodiacal — anclada abajo a la derecha */}
        {illustration && (
          <Image
            source={illustration}
            style={card.illustration}
            resizeMode="contain"
            accessibilityLabel={sunSignEs ?? ''}
          />
        )}

        {/* Logo ENEA */}
        <View style={card.brandWrap}>
          <EneaLogo width={CARD_W * 0.22} />
        </View>
      </ViewShot>
    );
  },
);

const card = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  quoteWrap: {
    paddingHorizontal: CARD_W * 0.08,
    paddingTop: CARD_W * 0.07,
    flex: 1,
    gap: 20,
  },
  quoteText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: CARD_W * 0.094,
    fontStyle: 'italic',
    fontWeight: '400',
    lineHeight: CARD_W * 0.13,
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: CARD_W * 0.033,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.3,
  },
  illustration: {
    position: 'absolute',
    width:  CARD_W * 0.58,
    height: CARD_W * 0.58,
    bottom: CARD_H * 0.04,
    right:  CARD_W * -0.04,
  },
  brandWrap: {
    position: 'absolute',
    bottom: CARD_H * 0.05,
    left:   CARD_W * 0.08,
  },
});

// ─── Componente ──────────────────────────────────────────────────────────────
export const DailyQuoteScreen: React.FC = () => {
  const { enneagramType, natalChart, tonePreferences, birthData, numerologyProfile, firstName } =
    useOnboardingStore();
  const { todayQuote, setTodayQuote, toggleSave } = useQuoteStore();
  const { colors, isDark } = useTheme();
  const { isAnonymous } = useAuthContext();
  const [isGenerating,    setIsGenerating]    = useState(false);
  const [gateVisible,     setGateVisible]     = useState(false);

  const palette = natalChart?.dominantPlanet
    ? PLANET_PALETTES[natalChart.dominantPlanet]
    : DEFAULT_PALETTE;

  // Ilustración del signo solar del usuario
  const sunSignInfo  = birthData?.date ? getSunSign(birthData.date) : null;
  const sunSignEs    = sunSignInfo
    ? ZODIAC_SIGNS.find(z => z.name === sunSignInfo.name)?.nameEs
    : null;
  const illustrationMap = isDark ? ILLUSTRATIONS_DARK : ILLUSTRATIONS_LIGHT;
  const illustration = sunSignEs ? illustrationMap[sunSignEs] : undefined;

  // Numerología del día universal
  const universalDay        = React.useMemo(() => calculateUniversalDay(), []);
  const dailyNumerologyPhrase = getDailyNumerologyPhrase(universalDay);

  // Animaciones
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(12)).current;
  const heartAnim   = useRef(new Animated.Value(1)).current;
  const shareCardRef = useRef<ViewShot>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const animate = () =>
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 900,  useNativeDriver: true }),
      ]).start();

    if (todayQuote && todayQuote.date === today) { animate(); return; }

    setIsGenerating(true);
    generateDailyQuote({
      firstName:        firstName || 'amigo',
      enneagramType,
      natalChart,
      numerologyProfile,
      tonePreferences,
      birthDate:        birthData?.date,
    })
      .then(setTodayQuote)
      .finally(() => { setIsGenerating(false); animate(); });
  }, []);

  const handleSave = useCallback(async () => {
    if (!todayQuote) return;
    const wasFavorite = todayQuote.isFavorite;
    toggleSave(todayQuote.id);
    Animated.sequence([
      Animated.spring(heartAnim, { toValue: 1.35, tension: 200, friction: 4,  useNativeDriver: true }),
      Animated.spring(heartAnim, { toValue: 1,    tension: 200, friction: 8,  useNativeDriver: true }),
    ]).start();

    // Mostrar gate la primera vez que un usuario anónimo guarda una frase
    if (isAnonymous && !wasFavorite) {
      try {
        const shown = await AsyncStorage.getItem(EMAIL_GATE_KEY);
        if (!shown) setGateVisible(true);
      } catch {}
    }
  }, [todayQuote, isAnonymous, toggleSave]);

  const handleGateDismiss = useCallback(async () => {
    setGateVisible(false);
    try { await AsyncStorage.setItem(EMAIL_GATE_KEY, 'true'); } catch {}
  }, []);

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!todayQuote || !shareCardRef.current) return;
    try {
      setIsSharing(true);
      // Captura la tarjeta como imagen
      const uri = await (shareCardRef.current as any).capture();
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Compartir en Instagram',
          UTI: 'public.jpeg',
        });
      }
    } catch (_) {
    } finally {
      setIsSharing(false);
    }
  };

  const isSaved = todayQuote?.isFavorite ?? false;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GeometryBackground color={palette.primary} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* ── 1. ANCLA TEMPORAL: fecha ──────────────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {formatDate(new Date())}
          </Text>
          {todayQuote?.planetaryContext && (
            <View style={[styles.planetBadge, { borderColor: palette.primary + '40' }]}>
              <View style={[styles.planetDot, { backgroundColor: palette.primary }]} />
              <Text style={[styles.planetText, { color: palette.primary }]}>
                {todayQuote.planetaryContext}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ── 2. FRASE: protagonista absoluto ──────────────────────────── */}
        <Animated.View
          style={[
            styles.quoteBlock,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Comilla decorativa — ancla editorial */}
          <Text style={[styles.openMark, { color: palette.primary }]}>"</Text>
          <Text style={[styles.quoteText, { color: colors.text }]}>
            {todayQuote?.text ?? ''}
          </Text>
        </Animated.View>

        {/* ── 3. ILUSTRACIÓN ZODIACAL ───────────────────────────────────── */}
        {illustration && (
          <Animated.View style={[styles.illustrationBlock, { opacity: fadeAnim }]}>
            <View style={[styles.illustrationRule, { backgroundColor: palette.primary + '20' }]} />
            <Image
              source={illustration}
              style={styles.illustrationImage}
              resizeMode="contain"
              accessibilityLabel={`Ilustración ${sunSignEs}`}
            />
            <View style={[styles.illustrationRule, { backgroundColor: palette.primary + '20' }]} />
          </Animated.View>
        )}

        {/* ── 4. POR QUÉ HOY ───────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.contextBlock,
            { opacity: fadeAnim },
            !illustration && styles.contextBlockNoIllustration,
          ]}
        >
          <Text style={[styles.sectionLabel, { color: palette.primary + '80' }]}>
            Por qué esta frase hoy
          </Text>
          <Text style={[styles.contextText, { color: colors.textSecondary }]}>
            {todayQuote?.explanation ?? ''}
          </Text>
        </Animated.View>

        {/* ── 5. NÚMERO DEL DÍA ────────────────────────────────────────── */}
        <Animated.View style={[styles.numerologyBlock, { opacity: fadeAnim }]}>
          <View style={[styles.hairline, { backgroundColor: palette.primary + '20' }]} />
          <View style={styles.numerologyRow}>
            <View style={styles.numerologyLeft}>
              <Text style={[styles.numerologyNumber, { color: palette.primary }]}>
                {universalDay}
              </Text>
              <Text style={[styles.numerologyCaption, { color: palette.primary + '55' }]}>
                DÍA UNIVERSAL
              </Text>
            </View>
            <View style={[styles.numerologyDivider, { backgroundColor: palette.primary + '20' }]} />
            <Text style={[styles.numerologyPhrase, { color: colors.textMuted }]}>
              {dailyNumerologyPhrase}
            </Text>
          </View>
        </Animated.View>

      </ScrollView>

      {/* ── GENERATING OVERLAY ───────────────────────────────────────────── */}
      {isGenerating && (
        <View style={styles.generatingOverlay}>
          <ActivityIndicator size="small" color={palette.primary} />
          <Text style={[styles.generatingText, { color: palette.primary + '90' }]}>
            Componiendo tu frase…
          </Text>
        </View>
      )}

      {/* ── SHARE CARD: renderizada fuera de pantalla para captura ───────── */}
      <View style={styles.offscreen} pointerEvents="none">
        <ShareCard
          ref={shareCardRef}
          quote={todayQuote?.text ?? ''}
          date={formatDate(new Date())}
          illustration={illustration}
          sunSignEs={sunSignEs}
        />
      </View>

      {/* ── EMAIL GATE ───────────────────────────────────────────────────── */}
      <EmailGateSheet visible={gateVisible} onDismiss={handleGateDismiss} />

      {/* ── ACTION BAR ───────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.actionBar,
          {
            opacity: fadeAnim,
            backgroundColor: colors.background + 'F2',
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleSave}
          activeOpacity={0.7}
          accessibilityLabel={isSaved ? 'Quitar de favoritos' : 'Guardar como favorito'}
          accessibilityRole="button"
        >
          <Animated.Text
            style={[
              styles.actionIcon,
              { color: isSaved ? palette.primary : colors.textSecondary },
              { transform: [{ scale: heartAnim }] },
            ]}
          >
            {isSaved ? '♥' : '♡'}
          </Animated.Text>
          <Text style={[styles.actionLabel, { color: isSaved ? palette.primary : colors.textMuted }]}>
            {isSaved ? 'Guardado' : 'Guardar'}
          </Text>
        </TouchableOpacity>

        <View style={styles.ornament}>
          <View style={[styles.ornamentDot,  { backgroundColor: palette.primary + '40' }]} />
          <View style={[styles.ornamentLine, { backgroundColor: palette.primary + '20' }]} />
          <View style={[styles.ornamentDot,  { backgroundColor: palette.primary + '40' }]} />
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleShare}
          activeOpacity={0.7}
          disabled={isSharing}
          accessibilityLabel="Compartir frase como imagen"
          accessibilityRole="button"
        >
          {isSharing
            ? <ActivityIndicator size="small" color={colors.textSecondary} />
            : <Text style={[styles.actionIcon, { color: colors.textSecondary }]}>↑</Text>
          }
          <Text style={[styles.actionLabel, { color: colors.textMuted }]}>
            {isSharing ? 'Creando…' : 'Compartir'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 112,
  },

  // ── 1. Header ──────────────────────────────────────────────────────────────
  header: {
    gap: 12,
    marginBottom: 44,
  },
  dateText: {
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  planetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  planetDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  planetText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // ── 2. Quote ───────────────────────────────────────────────────────────────
  quoteBlock: {
    marginBottom: 48,
  },
  openMark: {
    fontFamily: GEORGIA,
    fontSize: 80,
    lineHeight: 64,
    fontWeight: '400',
    marginBottom: 4,
    marginLeft: -4,
  },
  quoteText: {
    fontFamily: GEORGIA,
    fontSize: 26,
    fontStyle: 'italic',
    fontWeight: '400',
    lineHeight: 44,
    letterSpacing: -0.3,
  },

  // ── 3. Ilustración ─────────────────────────────────────────────────────────
  illustrationBlock: {
    alignItems: 'center',
    marginBottom: 44,
    gap: 20,
  },
  illustrationRule: {
    width: '40%',
    height: 1,
  },
  illustrationImage: {
    width: 240,
    height: 240,
  },

  // ── 4. Contexto ────────────────────────────────────────────────────────────
  contextBlock: {
    gap: 10,
    marginBottom: 36,
  },
  contextBlockNoIllustration: {
    marginTop: 0,
  },
  sectionLabel: {
    fontFamily: GEORGIA,
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  contextText: {
    fontSize: 14,
    lineHeight: 23,
    fontWeight: '400',
    letterSpacing: 0.1,
  },

  // ── 5. Numerología ─────────────────────────────────────────────────────────
  numerologyBlock: {
    gap: 20,
  },
  hairline: {
    height: 1,
  },
  numerologyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  numerologyLeft: {
    alignItems: 'center',
    gap: 3,
    minWidth: 48,
  },
  numerologyNumber: {
    fontFamily: GEORGIA,
    fontSize: 48,
    fontWeight: '300',
    lineHeight: 50,
  },
  numerologyCaption: {
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  numerologyDivider: {
    width: 1,
    height: 40,
  },
  numerologyPhrase: {
    flex: 1,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '400',
    letterSpacing: 0.1,
  },

  // ── Off-screen share card ──────────────────────────────────────────────────
  offscreen: {
    position: 'absolute',
    top: 0,
    left: -9999,
    opacity: 0,
  },

  // ── Generating overlay ─────────────────────────────────────────────────────
  generatingOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  generatingText: {
    fontSize: 13,
    letterSpacing: 0.8,
    fontWeight: '500',
  },

  // ── Action bar ─────────────────────────────────────────────────────────────
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 5,
    minWidth: 64,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ornamentDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  ornamentLine: {
    width: 24,
    height: 1,
  },
});
