import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import OtpInput from '../../components/atoms/OtpInput';
import Button from '../../components/atoms/Button';
import { VerificationFormData,verificationSchema } from '../../utils/validation';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Verification'>;

const VerificationScreen: React.FC<Props> = ({ route }) => {
  const { email, password } = route.params;
  const { verify, login, isLoading } = useAuth();
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(60);

  const { control, handleSubmit, formState: { errors } } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const onSubmit = async (data: VerificationFormData) => {
    setVerificationError(null);
    const success = await verify(data.code);
    
    if (success) {
      // After successful verification, log in the user
      await login(email, password);
    } else {
      setVerificationError('Invalid verification code');
    }
  };

  const resendCode = () => {
    // In a real app, this would make an API call to resend the code
    setTimer(60);
    // Show a success message
    setVerificationError('A new code has been sent');
    setTimeout(() => {
      setVerificationError(null);
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Account</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit code sent to {email}
        </Text>

        {verificationError && (
          <Text 
            style={[
              styles.messageText, 
              verificationError.includes('Invalid') 
                ? styles.errorText 
                : styles.successText
            ]}
          >
            {verificationError}
          </Text>
        )}

        <OtpInput
          name="code"
          control={control}
          error={errors.code?.message}
        />

        <Button
          title="Verify"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive a code?{' '}
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            ) : (
              <Text 
                style={styles.resendLinkText}
                onPress={resendCode}
              >
                Resend
              </Text>
            )}
          </Text>
        </View>
      </View>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  messageText: {
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4d4f',
  },
  successText: {
    color: '#52c41a',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  timerText: {
    color: '#999',
  },
  resendLinkText: {
    color: '#4361EE',
    fontWeight: '600',
  },
});

export default VerificationScreen;