import React, { createContext, useContext } from 'react';
import { COLORS } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';

export type ColorScheme = typeof COLORS.dark;

interface ThemeContextValue {
  colors: ColorScheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: COLORS.dark,
  isDark: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDark = useSettingsStore((s) => s.isDark);
  const colors = isDark ? COLORS.dark : COLORS.light;
  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
