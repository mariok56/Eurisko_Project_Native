import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthForm from '../../components/organisms/AuthForm';
import { loginSchema, LoginFormData } from '../../utils/validation';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getResponsiveValue } from '../../utils/responsive';
import fontVariants from '../../assets/fonts/fonts';
import Header from '../../components/molecules/Header';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    const success = await login(data.email, data.password);
    
    if (!success) {
      setLoginError('Invalid email or password');
    }
  };

  const formFields = [
    {
      name: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      keyboardType: 'email-address' as const,
      autoCapitalize: 'none' as const,
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      secureTextEntry: true,
    },
  ];

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={true}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Login" showBackButton={false} showThemeToggle={true} />
        
        <View style={styles.content}>
          <Text 
            style={[
              styles.title, 
              { color: colors.text },
              fontVariants.heading1
            ]}
          >
            Welcome Back
          </Text>
          <Text 
            style={[
              styles.subtitle, 
              { color: colors.text },
              fontVariants.body
            ]}
          >
            Sign in to continue
          </Text>

          <AuthForm
            fields={formFields}
            control={control}
            errors={errors}
            onSubmit={handleSubmit(onSubmit)}
            submitButtonText="Login"
            isLoading={isLoading}
            errorMessage={loginError}
          />

          <View style={styles.footerContainer}>
            <Text 
              style={[
                styles.footerText, 
                { color: colors.text },
                fontVariants.body
              ]}
            >
              Don't have an account? 
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text 
                style={[
                  styles.linkText, 
                  { color: colors.primary },
                  fontVariants.bodyBold
                ]}
              >
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: getResponsiveValue(24),
    justifyContent: 'center',
  },
  title: {
    marginBottom: getResponsiveValue(8),
  },
  subtitle: {
    marginBottom: getResponsiveValue(32),
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: getResponsiveValue(24),
  },
  footerText: {
    marginRight: getResponsiveValue(4),
  },
  linkText: {
  },
});

export default LoginScreen;