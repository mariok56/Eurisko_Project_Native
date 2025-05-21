import React, {useEffect} from 'react';
import {Platform, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useQuery} from '@tanstack/react-query';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import ForgotPasswordScreen from '../screens/auth/ForgetPasswordScreen';
import ProfileEditScreen from '../screens/Profile/ProfileEditScreen';
import TabNavigator from './TabNav';
import {RootStackParamList} from '../types/navigation';
import {useAuthStore} from '../store/authStore';
import {useTheme} from '../contexts/ThemeContext';
import {getTokens} from '../lib/axioInstance';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Custom hook to check authentication status
const useInitAuth = () => {
  const {setAuthenticated} = useAuthStore();

  return useQuery({
    queryKey: ['auth-init'],
    queryFn: async () => {
      const tokens = await getTokens();
      const isAuthenticated = !!tokens?.accessToken;

      // Update the Zustand store
      setAuthenticated(isAuthenticated);

      return isAuthenticated;
    },
    staleTime: Infinity,
    retry: false,
  });
};

const AppNavigator: React.FC = () => {
  const {isAuthenticated} = useAuthStore();
  const {colors, isDarkMode} = useTheme();
  const authInitQuery = useInitAuth();

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
      StatusBar.setBackgroundColor(colors.background);
    }
  }, [isDarkMode, colors]);

  // Show a loading state if we're still initializing
  if (authInitQuery.isLoading) {
    return null; // You could return a splash screen here
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={true}
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: {backgroundColor: colors.background},
            animation: 'slide_from_right',
          }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Home" component={TabNavigator} />
              <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
              />
              <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen
                name="Verification"
                component={VerificationScreen}
              />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
