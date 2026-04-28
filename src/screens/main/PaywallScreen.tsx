/**
 * PaywallScreen
 * Se muestra cuando el trial de 3 días ha expirado.
 * Presenta las dos opciones de suscripción: mensual (0,99€) y anual (8,99€).
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FONT_FAMILY, TYPOGRAPHY } from '@/constants/theme';
import { MainStackParamList } from '@/navigation/types';
import { getOfferings, purchasePackage, restorePurchases, RCPackage } from '@/services/revenueCatService';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Paywall'>;
};

const ACCENT  = '#FC8181';
const BG      = '#0A0A0F';
const SURFACE = '#111118';
const BORDER  = '#2A2A3A';

const BENEFITS = [
  { icon: '✦', text: 'Una frase única para ti cada día' },
  { icon: '✦', text: 'Basada en tu carta natal y eneatipo' },
  { icon: '✦', text: 'Aviso diario a la hora que elijas' },
  { icon: '✦', text: 'Guarda y comparte las frases que te impactan' },
];

export const PaywallScreen: React.FC<Props> = ({ navigation }) => {
  const [packages,    setPackages]    = useState<RCPackage[]>([]);
  const [selected,    setSelected]    = useState<'monthly' | 'annual'>('annual');
  const [loading,     setLoading]     = useState(false);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [restoring,   setRestoring]   = useState(false);
  const [offeringsError, setOfferingsError] = useState<string | null>(null);

  const loadOfferings = () => {
    setLoadingPkgs(true);
    setOfferingsError(null);
    getOfferings()
      .then((pkgs) => {
        setPackages(pkgs);
        setOfferingsError(null);
      })
      .catch((err: any) => {
        setOfferingsError(String(err?.message ?? err));
      })
      .finally(() => setLoadingPkgs(false));
  };

  useEffect(() => {
    loadOfferings();
  }, []);

  const monthlyPkg = packages.find(p =>
    p.identifier === '$rc_monthly' || p.product.identifier.includes('monthly'),
  );
  const annualPkg = packages.find(p =>
    p.identifier === '$rc_annual' || p.product.identifier.includes('annual'),
  );

  // Formato español sin espacio: "0,99€" / "8,99€"
  // Usamos el valor numérico de RevenueCat y forzamos el símbolo € (mercado español).
  const formatPriceEUR = (price: number | undefined): string => {
    if (price === undefined || Number.isNaN(price)) return '';
    return `${price.toFixed(2).replace('.', ',')}€`;
  };

  const monthlyPrice = formatPriceEUR(monthlyPkg?.product.price) || '0,99€';
  const annualPrice  = formatPriceEUR(annualPkg?.product.price)  || '8,99€';

  const handlePurchase = async () => {
    const pkg = selected === 'monthly' ? monthlyPkg : annualPkg;
    if (!pkg) {
      Alert.alert(
        'Productos no disponibles',
        'No se pudieron cargar los planes. Comprueba tu conexión e inténtalo de nuevo.',
        [{ text: 'OK' }],
      );
      return;
    }

    setLoading(true);
    try {
      const success = await purchasePackage(pkg);
      if (success) {
        navigation.replace('Tabs');
      }
    } catch {
      Alert.alert(
        'Error al procesar el pago',
        'Inténtalo de nuevo. Si el problema persiste, usa "Restaurar compras".',
        [{ text: 'OK' }],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        navigation.replace('Tabs');
      } else {
        Alert.alert(
          'Sin compras anteriores',
          'No encontramos ninguna suscripción activa asociada a esta cuenta.',
          [{ text: 'OK' }],
        );
      }
    } catch {
      Alert.alert('Error', 'No se pudieron restaurar las compras.', [{ text: 'OK' }]);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* ── Cerrar (solo en desarrollo) ──────────────────────────────── */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.replace('Tabs')}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        )}

        {/* ── Encabezado ──────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.badge}>ASTRO ENEA</Text>
          <Text style={styles.heading}>Tu prueba ha terminado</Text>
          <Text style={styles.subheading}>
            Continúa recibiendo tu frase diaria,{'\n'}hecha solo para ti.
          </Text>
        </View>

        {/* ── Beneficios ───────────────────────────────────────────────── */}
        <View style={styles.benefits}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{b.icon}</Text>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Planes ───────────────────────────────────────────────────── */}
        {loadingPkgs ? (
          <ActivityIndicator color={ACCENT} style={{ marginVertical: 32 }} />
        ) : offeringsError && packages.length === 0 ? (
          <View style={styles.errorBlock}>
            <Text style={styles.errorTitle}>No se pudieron cargar los planes</Text>
            <Text style={styles.errorBody}>
              Comprueba tu conexión e inténtalo de nuevo.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={loadOfferings}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Reintentar cargar planes"
            >
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.plans}>

            {/* Anual — destacado como mejor opción */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selected === 'annual' && styles.planCardSelected,
              ]}
              onPress={() => setSelected('annual')}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === 'annual' }}
              accessibilityLabel={`Plan anual: ${annualPrice} al año`}
            >
              <View style={styles.planBadgeWrap}>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>MEJOR VALOR</Text>
                </View>
              </View>
              <View style={styles.planRadioRow}>
                <View style={[styles.radio, selected === 'annual' && styles.radioSelected]}>
                  {selected === 'annual' && <View style={styles.radioDot} />}
                </View>
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, selected === 'annual' && styles.planNameSelected]}>
                    Anual
                  </Text>
                  <Text style={[styles.planPrice, selected === 'annual' && styles.planPriceSelected]}>
                    {annualPrice}
                    <Text style={styles.planPeriod}> / año</Text>
                  </Text>
                </View>
                <Text style={[styles.planSaving, selected === 'annual' && styles.planSavingSelected]}>
                  −16%
                </Text>
              </View>
            </TouchableOpacity>

            {/* Mensual */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selected === 'monthly' && styles.planCardSelected,
              ]}
              onPress={() => setSelected('monthly')}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === 'monthly' }}
              accessibilityLabel={`Plan mensual: ${monthlyPrice} al mes`}
            >
              <View style={styles.planRadioRow}>
                <View style={[styles.radio, selected === 'monthly' && styles.radioSelected]}>
                  {selected === 'monthly' && <View style={styles.radioDot} />}
                </View>
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, selected === 'monthly' && styles.planNameSelected]}>
                    Mensual
                  </Text>
                  <Text style={[styles.planPrice, selected === 'monthly' && styles.planPriceSelected]}>
                    {monthlyPrice}
                    <Text style={styles.planPeriod}> / mes</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.cta, (loading || loadingPkgs) && styles.ctaDisabled]}
          onPress={handlePurchase}
          disabled={loading || loadingPkgs}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Suscribirse"
          accessibilityState={{ disabled: loading || loadingPkgs }}
        >
          {loading
            ? <ActivityIndicator color="#1A2332" />
            : <Text style={styles.ctaText}>Recibir mi frase</Text>
          }
        </TouchableOpacity>

        {/* ── Links secundarios ─────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={handleRestore}
          disabled={restoring}
          activeOpacity={0.6}
          style={styles.restoreBtn}
          accessibilityRole="button"
          accessibilityLabel="Restaurar compras anteriores"
        >
          <Text style={styles.restoreText}>
            {restoring ? 'Comprobando…' : 'Restaurar compras'}
          </Text>
        </TouchableOpacity>

        {/* ── Disclosure de suscripción (Apple Guideline 3.1.2) ──────────── */}
        <Text style={styles.legal}>
          Astro Enea Premium · Suscripción {selected === 'annual' ? 'anual' : 'mensual'} de {selected === 'annual' ? annualPrice : monthlyPrice} {selected === 'annual' ? 'al año' : 'al mes'}.
          {'\n'}
          La suscripción se renueva automáticamente al final de cada periodo y se cobra a través de tu cuenta de Apple ID, salvo que la canceles al menos 24 horas antes del final del periodo en curso. Puedes gestionar y cancelar tu suscripción en cualquier momento desde los Ajustes de tu dispositivo.
        </Text>

        {/* ── Enlaces legales ───────────────────────────────────────────── */}
        <View style={styles.legalLinksRow}>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
            accessibilityRole="link"
            accessibilityLabel="Términos de uso"
          >
            <Text style={styles.legalLink}>Términos de uso</Text>
          </TouchableOpacity>
          <Text style={styles.legalSep}>·</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://hianadee.github.io/enea/privacy-policy.html')}
            accessibilityRole="link"
            accessibilityLabel="Política de privacidad"
          >
            <Text style={styles.legalLink}>Política de privacidad</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },

  // ── Close ───────────────────────────────────────────────────────────────────
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
  },
  closeText: {
    color: '#3A3A4A',
    fontSize: 18,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  badge: {
    fontSize: 11,
    color: ACCENT,
    letterSpacing: 2.5,
    fontWeight: '600',
    marginBottom: 16,
  },
  heading: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 32,
    color: '#F0EEF6',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
  },
  subheading: {
    ...TYPOGRAPHY.presets.bodyLg,
    color: '#8B8A9E',
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── Benefits ─────────────────────────────────────────────────────────────────
  benefits: {
    gap: 14,
    marginBottom: 36,
    paddingHorizontal: 4,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitIcon: {
    color: ACCENT,
    fontSize: 13,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    ...TYPOGRAPHY.presets.body,
    color: '#C8C7D9',
    lineHeight: 22,
  },

  // ── Plans ────────────────────────────────────────────────────────────────────
  plans: {
    gap: 10,
    marginBottom: 28,
  },
  planCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
  },
  planCardSelected: {
    borderColor: ACCENT + 'AA',
    backgroundColor: '#1A1118',
  },
  planBadgeWrap: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  planBadge: {
    backgroundColor: ACCENT + '22',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: ACCENT + '44',
  },
  planBadgeText: {
    fontSize: 9,
    color: ACCENT,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  planRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#3A3A4A',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: ACCENT,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  planInfo: {
    flex: 1,
    gap: 3,
  },
  planName: {
    ...TYPOGRAPHY.presets.bodySm,
    color: '#8B8A9E',
    fontWeight: '500',
  },
  planNameSelected: {
    color: '#F0EEF6',
  },
  planPrice: {
    fontFamily: FONT_FAMILY.serif,
    fontSize: 22,
    color: '#8B8A9E',
    fontWeight: '300',
  },
  planPriceSelected: {
    color: '#F0EEF6',
  },
  planPeriod: {
    fontFamily: FONT_FAMILY.sans ?? undefined,
    fontSize: 14,
    color: '#8B8A9E',
  },
  planSaving: {
    fontSize: 13,
    color: '#8B8A9E',
    fontWeight: '600',
  },
  planSavingSelected: {
    color: ACCENT,
  },

  // ── CTA ──────────────────────────────────────────────────────────────────────
  cta: {
    backgroundColor: '#F0EEF6',
    borderRadius: 100,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    color: '#1A2332',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ── Links secundarios ─────────────────────────────────────────────────────────
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  restoreText: {
    color: '#8B8A9E',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  legal: {
    ...TYPOGRAPHY.presets.caption,
    color: '#5A5A6E',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  errorBlock: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
  },
  errorTitle: {
    ...TYPOGRAPHY.presets.title,
    color: '#F0EEF6',
    textAlign: 'center',
  },
  errorBody: {
    ...TYPOGRAPHY.presets.body,
    color: '#8B8A9E',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: ACCENT,
  },
  retryText: {
    ...TYPOGRAPHY.presets.button,
    color: ACCENT,
  },
  legalLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  legalLink: {
    ...TYPOGRAPHY.presets.caption,
    color: '#7A7A8E',
    textDecorationLine: 'underline',
  },
  legalSep: {
    ...TYPOGRAPHY.presets.caption,
    color: '#5A5A6E',
  },
});
