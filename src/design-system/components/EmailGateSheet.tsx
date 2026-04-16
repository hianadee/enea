/**
 * EmailGateSheet.tsx
 * Bottom sheet que aparece la primera vez que un usuario anónimo
 * guarda una frase como favorita.
 *
 * No bloquea la acción: la frase ya se guardó (sesión anónima).
 * El objetivo es recordar al usuario que, sin email, perderá sus
 * favoritos si reinstala la app o cambia de dispositivo.
 *
 * Al enviar el email solo llama a linkEmail() — el perfil ya
 * existe en Supabase desde el onboarding.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { linkEmail } from '@/services/authService';
import { colors } from '@/design-system/tokens';

interface Props {
  visible:   boolean;
  onDismiss: () => void;
}

export const EmailGateSheet: React.FC<Props> = ({ visible, onDismiss }) => {
  const [email,   setEmail]   = useState('');
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSend = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Introduce un email válido');
      return;
    }
    setError('');
    setSending(true);
    try {
      await linkEmail(trimmed);
      setSent(true);
    } catch (err: any) {
      const raw = (err?.message ?? '').toLowerCase();
      // Humanizar errores comunes de Supabase / red
      if (raw.includes('rate limit') || raw.includes('too many') || raw.includes('over_email_send_rate_limit'))
        setError('Demasiados intentos. Espera unos minutos.');
      else if (raw.includes('already registered') || raw.includes('already in use') || raw.includes('already been registered') || raw.includes('email exists'))
        setError('Este email ya está vinculado a otra cuenta.');
      else if (raw.includes('invalid') || raw.includes('format') || raw.includes('email_address_invalid'))
        setError('El formato del email no es válido.');
      else if (raw.includes('network') || raw.includes('fetch') || raw.includes('failed to fetch') || raw.includes('networkrequest'))
        setError('Sin conexión. Comprueba tu red e inténtalo de nuevo.');
      else if (raw.includes('not authenticated') || raw.includes('no session') || raw.includes('unauthenticated'))
        setError('Sesión expirada. Cierra y vuelve a abrir la app.');
      else if (raw.includes('email_change_new_email_taken') || raw.includes('new_email_taken'))
        setError('Este email ya está en uso. Prueba con otro.');
      else
        setError(`No se pudo guardar (${raw.slice(0, 60) || 'error desconocido'}). Inténtalo de nuevo.`);
    } finally {
      setSending(false);
    }
  };

  const handleDismiss = () => {
    setEmail('');
    setError('');
    setSent(false);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        />

        <View style={styles.sheet}>
          {/* Indicador de arrastre — decorativo */}
          <View
            style={styles.handle}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
          />

          {sent ? (
            /* ── Estado: email enviado ── */
            <View style={styles.sentBox}>
              <Text
                style={styles.sentIcon}
                accessibilityElementsHidden={true}
                importantForAccessibility="no-hide-descendants"
              >✉️</Text>
              <Text style={styles.sentTitle}>Revisa tu email</Text>
              <Text style={styles.sentSubtitle}>
                Te hemos enviado un enlace a{'\n'}
                {email.trim().toLowerCase()}.{'\n\n'}
                Púlsalo para confirmar tu email y guardar tus favoritos.
              </Text>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={handleDismiss}
                accessibilityRole="button"
                accessibilityLabel="Listo, cerrar"
              >
                <Text style={styles.doneBtnText} accessibilityElementsHidden={true}>Listo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Estado: formulario ── */
            <>
              <Text style={styles.title}>Guarda tus favoritos</Text>
              <Text style={styles.subtitle}>
                Tus frases están vinculadas a esta sesión.{'\n'}
                Sin email, las perderías si reinstalaras la app.
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor="#444444"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                  accessibilityLabel="Email para guardar tus favoritos"
                />
                <TouchableOpacity
                  style={[styles.sendBtn, (!email.trim() || sending) && styles.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={!email.trim() || sending}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Guardar email"
                  accessibilityState={{ disabled: !email.trim() || sending }}
                >
                  {sending
                    ? <ActivityIndicator color="#0A0A0F" size="small" accessibilityLabel="Enviando" />
                    : <Text style={styles.sendBtnText} accessibilityElementsHidden={true}>Guardar</Text>
                  }
                </TouchableOpacity>
              </View>

              {error ? (
                <View accessibilityLiveRegion="assertive">
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.skipBtn}
                onPress={handleDismiss}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel="Ahora no, cerrar"
              >
                <Text style={styles.skipText} accessibilityElementsHidden={true}>Ahora no</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: '#0F0F16',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#1E1E2E',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2A2A3A',
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    color: colors.fg.primary,
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 14,
    color: '#A8A8B8',
    lineHeight: 21,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  input: {
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
  errorText: { color: '#FC8181', fontSize: 13, marginTop: -8 },
  skipBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: { color: '#A8A8B8', fontSize: 13 },

  // Sent state
  sentBox: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  sentIcon:     { fontSize: 36, textAlignVertical: 'center' },
  sentTitle:    { fontSize: 18, color: colors.fg.primary, fontWeight: '500' },
  sentSubtitle: {
    fontSize: 14,
    color: '#A8A8B8',
    textAlign: 'center',
    lineHeight: 21,
  },
  doneBtn: {
    marginTop: 8,
    backgroundColor: colors.fg.primary,
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  doneBtnText: { color: '#1A2332', fontWeight: '600', fontSize: 15 },
});
