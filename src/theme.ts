import { createContext, createElement, ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

const lightColors = {
  background: '#F7F5F0',
  surface: '#FFFFFF',
  ink: '#171714',
  muted: '#74736C',
  line: '#E5E2DA',
  accent: '#5B796A',
  amber: '#B27420',
  red: '#B84335',
  destructiveLine: '#E5C1BA',
};

const darkColors: typeof lightColors = {
  background: '#121311',
  surface: '#1C1D1A',
  ink: '#F3F1EA',
  muted: '#AAA8A0',
  line: '#33342F',
  accent: '#92B7A2',
  amber: '#E1A34C',
  red: '#F07968',
  destructiveLine: '#5D3530',
};

export type ThemeColors = typeof lightColors;
export const spacing = { xs: 8, sm: 12, md: 20, lg: 32, xl: 48 };

const ThemeContext = createContext<{ colors: ThemeColors; isDark: boolean } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDark = useColorScheme() === 'dark';
  const value = useMemo(() => ({ colors: isDark ? darkColors : lightColors, isDark }), [isDark]);
  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider.');
  return theme;
}
