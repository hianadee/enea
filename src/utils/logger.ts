/**
 * logger.ts
 * Logger centralizado y gateado por __DEV__.
 *
 * En producción (release builds) todas las llamadas son no-ops,
 * lo que evita filtrar mensajes internos en la consola del dispositivo
 * o en herramientas de proxy (Proxyman, Charles, etc.).
 *
 * Uso:
 *   import { logger } from '@/utils/logger';
 *   logger.warn('[QuoteGenerator] Fallback:', err);
 *   logger.error('[Auth] Error:', msg);
 */

/* eslint-disable no-console */

const noop = () => {};

export const logger = {
  log:   __DEV__ ? (...args: unknown[]) => console.log(...args)   : noop,
  info:  __DEV__ ? (...args: unknown[]) => console.info(...args)  : noop,
  warn:  __DEV__ ? (...args: unknown[]) => console.warn(...args)  : noop,
  error: __DEV__ ? (...args: unknown[]) => console.error(...args) : noop,
  debug: __DEV__ ? (...args: unknown[]) => console.debug(...args) : noop,
};
