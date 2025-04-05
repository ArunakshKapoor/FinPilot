import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import { theme } from '../constants/theme';
import { useTheme } from 'react-native-paper';
import DashboardScreen from '../screens/DashboardScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import InsightsScreen from '../screens/InsightsScreen';

// Import screens
import PortfolioUploadScreen from '../screens/PortfolioUploadScreen';
import NewsScreen from '../screens/NewsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PortfolioUpload"
        component={PortfolioUploadScreen}
        options={{ title: 'Upload Portfolio' }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Portfolio Dashboard' }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          title: 'Investment Profile',
        }}
      />
      <Stack.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: 'Personalized Insights',
        }}
      />
      <Stack.Screen
        name="News"
        component={NewsScreen}
        options={{ title: 'Market News' }}
      />
    </Stack.Navigator>
  );
} 