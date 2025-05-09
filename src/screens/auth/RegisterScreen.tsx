import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthForm from '../../components/organisms/AuthForm';
import Header from '../../components/molecules/Header';
import { RegisterFormData, registerSchema } from '../../utils/validation';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getResponsiveValue } from '../../utils/responsive';
import fontVariants from '../../assets/fonts/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const { colors } = useTheme();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const success = await register(
      data.name,
      data.email,
      data.password,
      data.phoneNumber
    );
    
    if (success) {
      // Navigate to verification screen with email and password
      navigation.navigate('Verification', {
        email: data.email,
        password: data.password,
      });
    }
  };

  const formFields = [
    {
      name: 'name',
      label: 'Full Name',
      placeholder: 'Enter your full name',
    },
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
      placeholder: 'Create a password',
      secureTextEntry: true,
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      keyboardType: 'phone-pad' as const,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Create Account" showBackButton />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text 
            style={[
              styles.title, 
              { color: colors.text },
              fontVariants.heading1
            ]}
          >
            Create Account
          </Text>
          <Text 
            style={[
              styles.subtitle, 
              { color: colors.text },
              fontVariants.body
            ]}
          >
            Sign up to get started
          </Text>

          <AuthForm
            fields={formFields}
            control={control}
            errors={errors}
            onSubmit={handleSubmit(onSubmit)}
            submitButtonText="Register"
            isLoading={isLoading}
          />

          <View style={styles.footerContainer}>
            <Text 
              style={[
                styles.footerText, 
                { color: colors.text },
                fontVariants.body
              ]}
            >
              Already have an account? 
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text 
                style={[
                  styles.linkText, 
                  { color: colors.primary },
                  fontVariants.bodyBold
                ]}
              >
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: getResponsiveValue(24),
    paddingTop: getResponsiveValue(16),
    paddingBottom: getResponsiveValue(40),
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

export default RegisterScreen;