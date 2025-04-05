import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './src/store/store';
import { theme } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { loadPortfolio } from './src/store/portfolioSlice';

export default function App() {
  useEffect(() => {
    // Load saved portfolio data on app start
    store.dispatch(loadPortfolio());
  }, []);

  return (
    <StoreProvider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </StoreProvider>
  );
}