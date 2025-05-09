import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import { RegisterFormData,registerSchema } from '../../utils/validation';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register, isLoading } = useAuth();

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <Input
            name="name"
            control={control}
            label="Full Name"
            placeholder="Enter your full name"
            error={errors.name?.message}
          />

          <Input
            name="email"
            control={control}
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />

          <Input
            name="password"
            control={control}
            label="Password"
            placeholder="Create a password"
            secureTextEntry
            error={errors.password?.message}
          />

          <Input
            name="phoneNumber"
            control={control}
            label="Phone Number"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            error={errors.phoneNumber?.message}
          />

          <Button
            title="Register"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
          />

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Sign in</Text>
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
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#4361EE',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
