import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';
import HomeScreen from '../screens/HomeScreen';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f9f9f9',
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        {isAuthenticated ? (
          // Authenticated routes
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Home',
            }}
          />
        ) : (
          // Authentication routes
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                title: 'Create Account',
              }}
            />
            <Stack.Screen
              name="Verification"
              component={VerificationScreen}
              options={{
                title: 'Verification',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;