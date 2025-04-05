import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { theme as customTheme } from '../constants/theme';

// Define consistent colors for both themes
const commonColors = {
  primary: '#2196F3',  // Blue
  accent: '#03A9F4',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#B00020',
  info: '#2196F3',
  chart: {
    line: '#2196F3',
    pie: ['#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50'],
  },
};

// Merge our custom theme with Paper's themes
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...commonColors,
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    secondaryText: '#757575',
    elevation: {
      level0: 'transparent',
      level1: '#fff',
      level2: '#fff',
      level3: '#fff',
      level4: '#fff',
      level5: '#fff',
    },
  },
  spacing: customTheme.spacing,
  roundness: customTheme.roundness,
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...commonColors,
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    secondaryText: '#B0B0B0',
    elevation: {
      level0: '#121212',
      level1: '#1E1E1E',
      level2: '#222222',
      level3: '#242424',
      level4: '#272727',
      level5: '#2C2C2C',
    },
    card: '#1E1E1E',
    surfaceVariant: '#1E1E1E',
  },
  spacing: customTheme.spacing,
  roundness: customTheme.roundness,
};

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: lightTheme,
});

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
} 