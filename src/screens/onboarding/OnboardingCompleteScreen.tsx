import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { colors } from '@/design-system/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NatalChartWheel } from '@/design-system/components/NatalChartWheel';
import { useOnboardingStore } from '../../store/onboardingStore';
import { usePostHog } from 'posthog-react-native';
import { useOnboardingSave } from '../../hooks/useOnboardingSave';
import { useUserStore } from '../../store/userStore';
import { ENNEAGRAM_TYPES } from '../../constants/enneagram';
import { RootStackParamList } from '../../navigation/types';

export const OnboardingCompleteScreen: React.FC = () => {
  const { firstName, birthData, enneagramType, tonePreferences, natalChart } =
    useOnboardingStore();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { saveAndProceed, saveAnonymous } = useOnboardingSave();

  // Animaciones
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(24)).current;
  const chartAnim  = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Estado del email
  const [email,      setEmail]      = useState('');
  const [sending,    setSending]    = useState(false);
  const [sent,       setSent]       = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(chartAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const typeInfo = enneagramType ? ENNEAGRAM_TYPES[enneagramType] : null;

  const chartRotate = rotateAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['-6deg', '0deg'],
  });

  const setOnboardingCompleted = useUserStore((s) => s.setOnboardingCompleted);
  const setProfileSynced       = useUserStore((s) => s.setProfileSynced);
  const posthog = usePostHog();

  const handleBegin = async () => {
    // Intenta guardar el perfil anónimo en Supabase.
    // saveAnonymous() ya habrá guardado el backup local antes de intentar Supabase,
    // así que si lanza, el backup queda en AsyncStorage para reintento posterior.
    let synced = false;
    try {
      await saveAnonymous();
      synced = true;
      // Supabase OK → el backup fue eliminado dentro de saveAnonymous()
    } catch {
      // Sin red o Supabase caído: el backup local ya existe en AsyncStorage.
      // useAppReady reintentará el sync en el próximo arranque.
    }
    posthog?.capture('onboarding_completed');
    setOnboardingCompleted(true);
    setProfileSynced(synced);
    rootNav.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const handleSaveEmail = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setEmailError('Introduce un email válido');
      return;
    }
    setEmailError('');
    setSending(true);
    try {
      await saveAndProceed(trimmed);
      setSent(true);
    } catch (err: any) {
      const raw = (err?.message ?? '').toLowerCase();
      if (raw.includes('session missing') || raw.includes('not authenticated') || raw.includes('no session'))
        setEmailError('Sin conexión. Comprueba tu red e inténtalo de nuevo.');
      else if (raw.includes('rate limit') || raw.includes('too many'))
        setEmailError('Demasiados intentos. Espera unos minutos.');
      else if (raw.includes('already') || raw.includes('taken') || raw.includes('in use'))
        setEmailError('Este email ya está en uso. Prueba con otro.');
      else if (raw.includes('network') || raw.includes('fetch') || raw.includes('conexión'))
        setEmailError('Sin conexión. Comprueba tu red e inténtalo de nuevo.');
      else
        setEmailError(err?.message ?? 'No se pudo enviar. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const greeting = firstName ? `Tu ENEA está lista, ${firstName}.` : 'Tu ENEA está lista.';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.Text
            style={[styles.heading, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            {greeting}
          </Animated.Text>

          {/* Carta natal */}
          {birthData.date ? (
            <Animated.View
              style={[
                styles.chartContainer,
                { opacity: chartAnim, transform: [{ rotate: chartRotate }, { scale: chartAnim }] },
              ]}
            >
              <NatalChartWheel birthData={birthData} natalChart={natalChart} size={240} />
              <Text style={styles.chartLabel}>
                Carta natal · {birthData.locationName || birthData.date}
              </Text>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.symbolFallback, { opacity: fadeAnim }]}>
              <Text style={styles.symbol}>◎</Text>
            </Animated.View>
          )}

          {/* Resumen */}
          <Animated.View
            style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            {birthData.locationName && (
              <SummaryRow icon="☽" label="Nacimiento">
                {birthData.date} · {birthData.time} · {birthData.locationName}
              </SummaryRow>
            )}
            {typeInfo && (
              <SummaryRow icon="◎" label="Eneagrama">
                Tipo {enneagramType} · {typeInfo.name}
              </SummaryRow>
            )}
            {tonePreferences.spiritualTradition && (
              <SummaryRow icon="✦" label="Voz">
                {tonePreferences.spiritualTradition} · {tonePreferences.languageStyle} · {tonePreferences.energy}
              </SummaryRow>
            )}
          </Animated.View>

          <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
            A partir de ahora, cada mañana recibirás una frase compuesta únicamente para ti. No existe en ningún otro lugar.
          </Animated.Text>

          {/* ── Guardar con email ── */}
          <Animated.View style={[styles.emailSection, { opacity: fadeAnim }]}>
            {sent ? (
              /* Estado: email enviado */
              <View style={styles.sentBox}>
                <Text style={styles.sentIcon}>✉️</Text>
                <Text style={styles.sentTitle}>Revisa tu email</Text>
                <Text style={styles.sentSubtitle}>
                  Te hemos enviado un enlace a {email.trim().toLowerCase()}.{'\n'}
                  Púlsalo para guardar tu ENEA para siempre.
                </Text>
              </View>
            ) : (
              /* Estado: formulario */
              <>
                <Text style={styles.emailLabel}>Guarda tu ENEA</Text>
                <Text style={styles.emailSubtitle}>
                  Introduce tu email para no perder tu perfil ni tu historial.
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.emailInput}
                    placeholder="tu@email.com"
                    placeholderTextColor="#444444"
                    value={email}
                    onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSaveEmail}
                    accessibilityLabel="Email para guardar tu perfil"
                  />
                  <TouchableOpacity
                    style={[styles.sendBtn, (!email.trim() || sending) && styles.sendBtnDisabled]}
                    onPress={handleSaveEmail}
                    disabled={!email.trim() || sending}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Enviar email"
                    accessibilityState={{ disabled: !email.trim() || sending }}
                  >
                    {sending
                      ? <ActivityIndicator color="#0A0A0F" size="small" accessibilityLabel="Enviando" />
                      : <Text style={styles.sendBtnText} accessibilityElementsHidden={true}>Enviar</Text>
                    }
                  </TouchableOpacity>
                </View>
                {emailError ? (
                  <View accessibilityLiveRegion="assertive">
                    <Text style={styles.errorText}>{emailError}</Text>
                  </View>
                ) : null}
              </>
            )}
          </Animated.View>

        </ScrollView>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handleBegin}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Ver mi primera frase"
          >
            <Text style={styles.ctaBtnText} accessibilityElementsHidden={true}>Ver mi primera frase</Text>
          </TouchableOpacity>
          {!sent && (
            <TouchableOpacity
              onPress={handleBegin}
              activeOpacity={0.6}
              style={styles.skipBtn}
              accessibilityRole="button"
              accessibilityLabel="Ahora no, continuar sin email"
            >
              <Text style={styles.skipText} accessibilityElementsHidden={true}>Ahora no</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── SummaryRow ───────────────────────────────────────────────────────────────

const SummaryRow: React.FC<{ icon: string; label: string; children: React.ReactNode }> = ({
  icon, label, children,
}) => (
  <View style={rowStyles.row}>
    <Text
      style={rowStyles.icon}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >{icon}</Text>
    <View style={rowStyles.text}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{children}</Text>
    </View>
  </View>
);

const rowStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  icon:  { fontSize: 16, color: '#A8A8B8', width: 20, textAlign: 'center', marginTop: 1 },
  text:  { flex: 1 },
  label: { fontSize: 14, color: '#A8A8B8', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '600', marginBottom: 2 },
  value: { fontSize: 14, color: '#A8A8B8', lineHeight: 20 },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 16,
    alignItems: 'center',
  },
  heading: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 36,
    color: colors.fg.primary,
    fontWeight: '300',
    lineHeight: 46,
    letterSpacing: -0.5,
    alignSelf: 'flex-start',
    marginBottom: 36,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  chartLabel: {
    marginTop: 10,
    fontSize: 14,
    color: '#A8A8B8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  symbolFallback: { marginBottom: 28 },
  symbol: { fontSize: 48, color: '#7A7A8A' },
  card: {
    width: '100%',
    backgroundColor: '#080808',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
  },
  tagline: {
    fontSize: 16,
    color: '#A8A8B8',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },

  // ── Email section ──
  emailSection: {
    width: '100%',
    marginBottom: 8,
  },
  emailLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 20,
    color: colors.fg.primary,
    fontWeight: '300',
    marginBottom: 8,
  },
  emailSubtitle: {
    fontSize: 14,
    color: '#A8A8B8',
    lineHeight: 20,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    backgroundColor: '#13131A',
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.fg.primary,
  },
  sendBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.fg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#1A2332', fontWeight: '600', fontSize: 14 },
  errorText: { color: '#FC8181', fontSize: 14, marginTop: 8 },

  // ── Sent state ──
  sentBox: {
    alignItems: 'center',
    backgroundColor: '#13131A',
    borderWidth: 1,
    borderColor: '#2A2A3A',
    borderRadius: 16,
    padding: 24,
    gap: 8,
  },
  sentIcon:     { fontSize: 32, marginBottom: 4 },
  sentTitle:    { fontSize: 18, color: colors.fg.primary, fontWeight: '500' },
  sentSubtitle: { fontSize: 14, color: '#A8A8B8', textAlign: 'center', lineHeight: 20 },

  // ── Footer ──
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8,
  },
  ctaBtn: {
    backgroundColor: colors.fg.primary,
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: { color: '#1A2332', fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  skipBtn:    { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  skipText:   { color: '#A8A8B8', fontSize: 14 },
});
