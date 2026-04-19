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
  Dimensions,
  Vibration,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useQuoteStore } from '@/store/quoteStore';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY, FONT_FAMILY, SPACING, PLANET_PALETTES, DEFAULT_PALETTE } from '@/constants/theme';
import { GeometryBackground } from '@/design-system/components/GeometryBackground';
import { calculateUniversalDay, getDailyNumerologyPhrase, NUMEROLOGY_MEANINGS } from '@/utils/numerologyUtils';
import { getSunSign, ZODIAC_SIGNS } from '@/utils/astroUtils';
import { generateDailyQuote } from '@/services/quoteGeneratorService';


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

// ─── Tipografía — usar FONT_FAMILY + TYPOGRAPHY.presets desde theme ──────────

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

        {/* Logo Astro Enea */}
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
    fontFamily: FONT_FAMILY.serif,
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
  const { enneagramType, natalChart, tonePreferences, birthData, numerologyProfile, firstName, genderPreference } =
    useOnboardingStore();
  const { todayQuote, setTodayQuote, toggleSave } = useQuoteStore();
  const { colors, isDark } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);

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

  // ── Animaciones por sección ──────────────────────────────────────────────
  const animHeader  = useRef(new Animated.Value(0)).current; // fecha + badge
  const animQuote   = useRef(new Animated.Value(0)).current; // frase hero
  const animIllus   = useRef(new Animated.Value(0)).current; // ilustración
  const animContext = useRef(new Animated.Value(0)).current; // por qué hoy
  const animNumero  = useRef(new Animated.Value(0)).current; // numerología
  const heartAnim   = useRef(new Animated.Value(1)).current;
  const shareCardRef = useRef<ViewShot>(null);

  // Qué secciones scroll-triggered ya se dispararon
  const scrollFired = useRef({ illus: false, context: false, numero: false });
  const isReady     = useRef(false); // true una vez el contenido está listo

  const reveal = (anim: Animated.Value, delay = 0) =>
    Animated.timing(anim, { toValue: 1, duration: 550, delay, useNativeDriver: true }).start();

  const animateIn = () => {
    isReady.current = true;
    reveal(animHeader, 0);
    reveal(animQuote,  180);
  };

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (todayQuote && todayQuote.date === today) { animateIn(); return; }

    setIsGenerating(true);
    generateDailyQuote({
      firstName:        firstName || 'amigo',
      genderPreference: genderPreference ?? 'neutro',
      enneagramType,
      natalChart,
      numerologyProfile,
      tonePreferences,
      birthDate:        birthData?.date,
    })
      .then(setTodayQuote)
      .finally(() => { setIsGenerating(false); animateIn(); });
  }, []);

  // Estilo reutilizable: fade + subida 18px
  const revealStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  });

  // Handler de scroll — dispara secciones según threshold
  const handleScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (!isReady.current) return;
    const y = e.nativeEvent.contentOffset.y;
    if (!scrollFired.current.illus   && y > 60)  { scrollFired.current.illus   = true; reveal(animIllus); }
    if (!scrollFired.current.context && y > 140) { scrollFired.current.context = true; reveal(animContext); }
    if (!scrollFired.current.numero  && y > 320) { scrollFired.current.numero  = true; reveal(animNumero); }
  };

  const handleSave = useCallback(async () => {
    if (!todayQuote) return;
    toggleSave(todayQuote.id);
    // Haptic feedback — breve confirmación táctil (P1)
    Vibration.vibrate(30);
    Animated.sequence([
      Animated.spring(heartAnim, { toValue: 1.35, tension: 200, friction: 4,  useNativeDriver: true }),
      Animated.spring(heartAnim, { toValue: 1,    tension: 200, friction: 8,  useNativeDriver: true }),
    ]).start();
  }, [todayQuote, toggleSave]);

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
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >

        {/* ── 1. ANCLA TEMPORAL: fecha ──────────────────────────────────── */}
        <Animated.View style={[styles.header, revealStyle(animHeader)]}>
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
          style={[styles.quoteBlock, revealStyle(animQuote)]}
          accessible={true}
          accessibilityLabel={todayQuote?.text ?? ''}
        >
          <View style={[styles.quoteAccent, { backgroundColor: palette.primary }]} />
          <Text
            style={[styles.quoteText, { color: colors.text }]}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
          >
            {todayQuote?.text ?? ''}
          </Text>
        </Animated.View>

        {/* ── 3. ILUSTRACIÓN ZODIACAL ───────────────────────────────────── */}
        {illustration && (
          <Animated.View style={[styles.illustrationBlock, revealStyle(animIllus)]}>
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
            revealStyle(animContext),
            !illustration && styles.contextBlockNoIllustration,
          ]}
        >
          <Text style={[styles.sectionLabel, { color: palette.primary }]}>
            Por qué esta frase hoy
          </Text>
          <Text style={[styles.contextText, { color: colors.text }]}>
            {todayQuote?.explanation ?? ''}
          </Text>
        </Animated.View>

        {/* ── 5. NUMEROLOGÍA ───────────────────────────────────────────── */}
        <Animated.View style={[styles.numerologyBlock, revealStyle(animNumero)]}>
          <View style={[styles.hairline, { backgroundColor: palette.primary + '20' }]} />

          {/* Etiqueta de sección — contraste correcto */}
          <Text style={[styles.sectionLabel, { color: palette.primary }]}>
            Numerología de hoy
          </Text>

          {/* ── Día Universal ──────────────────────────────────────────── */}
          <View style={[styles.numCard, { borderColor: palette.primary + '22', backgroundColor: palette.primary + '08' }]}>
            {/* Overline */}
            <Text style={[styles.numCardLabel, { color: palette.primary }]}>
              DÍA UNIVERSAL
            </Text>
            {/* Cuerpo: número + línea + contenido */}
            <View style={styles.numCardBody}>
              <Text style={[styles.numCardNumber, { color: palette.primary }]}>
                {universalDay}
              </Text>
              <View style={[styles.numCardVline, { backgroundColor: palette.primary + '30' }]} />
              <View style={styles.numCardRight}>
                {/* Qué es — texto explicativo siempre visible */}
                <Text style={[styles.numCardWhat, { color: colors.textSecondary }]}>
                  La energía colectiva de hoy.{'\n'}El mismo número para todo el mundo.
                </Text>
                {/* Frase significativa del día */}
                <Text style={[styles.numCardPhrase, { color: colors.text }]}>
                  {dailyNumerologyPhrase}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Año Personal ───────────────────────────────────────────── */}
          {numerologyProfile?.personalYear != null && (() => {
            const py     = numerologyProfile.personalYear;
            const pyMean = NUMEROLOGY_MEANINGS[py];
            return (
              <View style={[styles.numCard, { borderColor: palette.primary + '18', backgroundColor: palette.primary + '05' }]}>
                {/* Overline */}
                <Text style={[styles.numCardLabel, { color: palette.primary }]}>
                  AÑO PERSONAL
                </Text>
                {/* Cuerpo */}
                <View style={styles.numCardBody}>
                  <Text style={[styles.numCardNumber, { color: palette.primary }]}>
                    {py}
                  </Text>
                  <View style={[styles.numCardVline, { backgroundColor: palette.primary + '25' }]} />
                  <View style={styles.numCardRight}>
                    {/* Qué es — texto explicativo */}
                    <Text style={[styles.numCardWhat, { color: colors.textSecondary }]}>
                      Tu ciclo numerológico personal.{'\n'}Se renueva cada año en tu cumpleaños.
                    </Text>
                    {/* Arquetipo del año */}
                    {pyMean && (
                      <Text style={[styles.numCardPhrase, { color: colors.text }]}>
                        {pyMean.title}
                      </Text>
                    )}
                    {/* Keywords — contexto adicional */}
                    {pyMean?.keywords?.length > 0 && (
                      <Text style={[styles.numCardKeywords, { color: colors.textSecondary }]}>
                        {pyMean.keywords.slice(0, 3).join(' · ')}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })()}
        </Animated.View>

      </ScrollView>

      {/* ── GENERATING OVERLAY ───────────────────────────────────────────── */}
      {isGenerating && (
        <View
          style={styles.generatingOverlay}
          accessibilityLiveRegion="polite"
          accessibilityLabel="Componiendo tu frase"
        >
          <ActivityIndicator size="small" color={palette.primary} accessibilityElementsHidden={true} />
          <Text
            style={[styles.generatingText, { color: palette.primary }]}
            accessibilityElementsHidden={true}
          >
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

      {/* ── ACTION BAR ───────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.actionBar,
          {
            opacity: animQuote,
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
    paddingBottom: 76,
  },

  // ── 1. Header ──────────────────────────────────────────────────────────────
  header: {
    gap: 12,
    marginBottom: 44,
  },
  dateText: {
    ...TYPOGRAPHY.presets.label,
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
    ...TYPOGRAPHY.presets.badge,
  },

  // ── 2. Quote ───────────────────────────────────────────────────────────────
  quoteBlock: {
    marginBottom: 48,
    flexDirection: 'row',
    gap: 18,
  },
  // Línea vertical de acento — ancla editorial sin ambigüedad
  quoteAccent: {
    width: 2,
    borderRadius: 1,
    marginTop: 4,
    marginBottom: 4,
  },
  quoteText: {
    flex: 1,
    ...TYPOGRAPHY.presets.quote,
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
    ...TYPOGRAPHY.presets.sectionTitle,
  },
  contextText: {
    ...TYPOGRAPHY.presets.bodyLg,
  },

  // ── 5. Numerología ─────────────────────────────────────────────────────────
  numerologyBlock: {
    gap: 12,
  },
  hairline: {
    height: 1,
  },
  // Card surface por cada métrica numerológica
  numCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 10,
  },
  // Overline: nombre de la métrica — 11px bold uppercase garantiza AA en todos los paletas
  numCardLabel: {
    ...TYPOGRAPHY.presets.label,
  },
  numCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  // Número grande en Georgia
  numCardNumber: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 52,
    fontWeight: '300',
    lineHeight: 54,
    width: 44,
    textAlign: 'center',
  },
  // Línea divisoria vertical
  numCardVline: {
    width: 1,
    alignSelf: 'stretch',
  },
  numCardRight: {
    flex: 1,
    gap: 6,
  },
  // Texto explicativo "qué es" — 13px sin opacity, color textSecondary ~5.4:1 ✓ AA
  numCardWhat: {
    ...TYPOGRAPHY.presets.captionItalic,
  },
  // Frase / arquetipo — 16px color text (blanco) — 20:1 ✓ AAA
  numCardPhrase: {
    ...TYPOGRAPHY.presets.bodyLgStrong,
  },
  // Keywords secundarias — 13px textSecondary ✓ AA
  numCardKeywords: {
    ...TYPOGRAPHY.presets.caption,
    letterSpacing: 0.3,
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
    ...TYPOGRAPHY.presets.caption,
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
    justifyContent: 'space-evenly',
    paddingHorizontal: SPACING.xl,
    paddingTop: 6,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 88,
    minHeight: 44,      // WCAG 2.5.5 — touch target mínimo 44×44pt
  },
  actionIcon: {
    fontSize: 18,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
