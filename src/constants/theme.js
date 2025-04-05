import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    accent: '#03A9F4',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    error: '#B00020',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
    chart: {
      line: '#2196F3',
      pie: ['#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50'],
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  roundness: 8,
};

export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
  },
}; 