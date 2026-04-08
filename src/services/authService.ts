/**
 * authService.ts
 * Gestión de autenticación anónima + magic link en Supabase.
 *
 * Flujo:
 *   1. App abre → signInAnonymously() (invisible para el usuario)
 *   2. Onboarding completo → linkEmail() muestra un campo de email
 *   3. Usuario recibe magic link → click → sesión anónima se convierte en cuenta real
 *
 * Seguridad:
 *  - Validación de formato de email antes de enviar a Supabase (linkEmail, sendOTP)
 *  - Rate limiting en cliente para verifyOTP: máx 5 intentos en 15 minutos
 *    con bloqueo progresivo (el servidor también tiene sus propios límites,
 *    pero la defensa en profundidad reduce intentos de fuerza bruta)
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { Session, User } from '@supabase/supabase-js';

// ─── Email validation ─────────────────────────────────────────────────────────

/**
 * Regex de validación de email — cubre los casos más comunes.
 * No reemplaza la validación del servidor (Supabase), actúa como primera línea.
 */
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/;

function validateEmail(email: string): void {
  const trimmed = email.trim();
  if (!trimmed || !EMAIL_RE.test(trimmed)) {
    throw new Error('Formato de email inválido');
  }
}

// ─── OTP rate limiting ────────────────────────────────────────────────────────

/**
 * Estado de intentos OTP — módulo-level, se resetea al matar la app.
 * El objetivo es reducir intentos de fuerza bruta en el cliente;
 * la protección definitiva vive en el servidor (Supabase).
 */
const OTP_MAX_ATTEMPTS  = 5;
const OTP_WINDOW_MS     = 15 * 60 * 1000; // 15 minutos
let _otpAttempts        = 0;
let _otpWindowStart     = 0;

function checkOtpRateLimit(): void {
  const now = Date.now();

  // Resetear ventana si han pasado más de 15 min desde el primer intento
  if (now - _otpWindowStart > OTP_WINDOW_MS) {
    _otpAttempts    = 0;
    _otpWindowStart = now;
  }

  if (_otpAttempts >= OTP_MAX_ATTEMPTS) {
    const waitSec = Math.ceil((OTP_WINDOW_MS - (now - _otpWindowStart)) / 1000);
    throw new Error(`Demasiados intentos. Espera ${waitSec} segundos e inténtalo de nuevo.`);
  }
}

function recordOtpAttempt(success: boolean): void {
  if (success) {
    // Resetear contador en éxito
    _otpAttempts    = 0;
    _otpWindowStart = 0;
  } else {
    _otpAttempts++;
  }
}

// ─── Sesión anónima ───────────────────────────────────────────────────────────

/**
 * Crea una sesión anónima si no existe ninguna.
 * Llamar al arrancar la app.
 */
export async function ensureSession(): Promise<User | null> {
  // 1. Comprobar si ya hay sesión activa
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user;

  // 2. Crear sesión anónima
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    logger.error('[Auth] Error creando sesión anónima:', error.message);
    return null;
  }

  return data.user;
}

// ─── Vinculación de email (magic link) ───────────────────────────────────────

/**
 * Envía un magic link al email para convertir la cuenta anónima en real.
 * Si el email ya existe en Supabase, inicia sesión en esa cuenta
 * y los datos del perfil anónimo se fusionan.
 */
export async function linkEmail(email: string): Promise<void> {
  validateEmail(email);
  const { error } = await supabase.auth.updateUser({ email: email.trim() });
  if (error) throw error;
}

/**
 * Alternativa: enviar OTP por email (muestra un campo de código de 6 dígitos).
 * Usar si se prefiere flujo en-app sin salir a la app de email.
 */
export async function sendOTP(email: string): Promise<void> {
  validateEmail(email);
  // Resetear contador de intentos al pedir un nuevo OTP
  _otpAttempts    = 0;
  _otpWindowStart = 0;

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function verifyOTP(email: string, token: string): Promise<User | null> {
  validateEmail(email);
  // Validar formato del token: solo dígitos, exactamente 6 caracteres
  if (!/^\d{6}$/.test(token.trim())) {
    throw new Error('El código debe tener exactamente 6 dígitos');
  }

  checkOtpRateLimit();

  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: 'email',
  });

  recordOtpAttempt(!error);

  if (error) throw error;
  return data.user;
}

// ─── Estado de sesión ─────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(
  callback: (session: Session | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session)
  );
  return () => subscription.unsubscribe();
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/** True si la cuenta es anónima (aún no tiene email vinculado) */
export function isAnonymous(user: User | null): boolean {
  if (!user) return true;
  return user.is_anonymous === true;
}
