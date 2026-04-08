/**
 * navigationRef.ts
 * Referencia global al NavigationContainer.
 * Permite navegar desde fuera del árbol de componentes React
 * (hooks de notificación, servicios, etc.)
 */

import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navega a la pestaña Hoy (DailyQuoteScreen) desde cualquier contexto.
 * Usa CommonActions.navigate para manejar navegación anidada sin conflictos de tipos.
 * Si el navigator aún no está listo, la llamada se ignora silenciosamente.
 */
export function navigateToToday(): void {
  if (!navigationRef.isReady()) return;

  // CommonActions.navigate resuelve automáticamente la jerarquía anidada:
  // Root → Main → Tabs → Today
  navigationRef.dispatch(
    CommonActions.navigate({
      name:   'Main',
      params: {
        screen: 'Tabs',
        params: { screen: 'Today' },
      },
    }),
  );
}
