import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, StatusBar, Alert} from 'react-native';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import OtpInput from '../../components/atoms/OtpInput';
import Button from '../../components/atoms/Button';
import Header from '../../components/molecules/Header';
import {VerificationFormData, verificationSchema} from '../../utils/validation';
import {RootStackParamList} from '../../types/navigation';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import {useVerifyOtp, useResendOtp, useLogin} from '../../hooks/useAuth';
import {useAuthStore} from '../../store/authStore';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<RootStackParamList, 'Verification'>;

const VerificationScreen: React.FC<Props> = ({route, navigation}) => {
  const {email, password} = route.params;
  const [timer, setTimer] = useState<number>(60);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null,
  );
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const {colors, isDarkMode} = useTheme();
  const {setAuthenticated} = useAuthStore();
  const queryClient = useQueryClient();

  // Add this ref to track if we've already sent the initial OTP request
  const initialOtpRequestSent = useRef(false);

  // React Query mutations
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: '',
    },
  });

  // Automatically request a new OTP when component mounts - FIXED VERSION WITH PROPER DEPENDENCIES
  useEffect(() => {
    // Only send OTP once when component mounts
    const autoResendOtp = async () => {
      // Check if we've already sent the initial request to prevent duplicates
      if (initialOtpRequestSent.current) {
        return;
      }

      // Mark that we've sent the request
      initialOtpRequestSent.current = true;

      try {
        setVerificationMessage('Sending verification code...');
        await resendOtpMutation.mutateAsync(email);
        setMessageType('success');
        setVerificationMessage(
          'A verification code has been sent to your email',
        );
        setTimer(60); // Reset timer
      } catch (error: any) {
        setMessageType('error');

        // Error handling is now user-friendly from the hook
        setVerificationMessage(
          error.message || 'Failed to send verification code',
        );
      }
    };

    autoResendOtp();

    // Include the dependencies but still use the ref check to prevent multiple calls
  }, [email, resendOtpMutation, setMessageType, setTimer]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const onSubmit = async (data: VerificationFormData) => {
    setVerificationMessage(null);

    try {
      // Ensure OTP is properly formatted
      const formattedOtp = data.code.toString().trim();
      console.log('Submitting verification with OTP:', formattedOtp);

      // Verify OTP
      await verifyOtpMutation.mutateAsync({email, otp: formattedOtp});

      // OTP verification successful, now try to login
      if (password) {
        try {
          await loginMutation.mutateAsync({
            email,
            password,
            token_expires_in: '1y',
          });

          // Login successful
          setAuthenticated(true);

          // Invalidate user profile query to fetch fresh data
          queryClient.invalidateQueries({queryKey: ['user-profile']});

          // Show success message
          Alert.alert(
            'Success',
            'Your email has been verified and you are now logged in!',
            [{text: 'OK'}],
          );
        } catch (error: any) {
          setMessageType('error');
          setVerificationMessage(
            error.message || 'Login failed after verification',
          );
        }
      } else {
        // Handle case where password might not be available
        setMessageType('success');
        setVerificationMessage('Verification successful! Please log in.');

        // Redirect to login
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      }
    } catch (error: any) {
      setMessageType('error');
      setVerificationMessage(error.message || 'Verification failed');
    }
  };

  // Updated to prevent rapid multiple clicks
  const handleResendCode = async () => {
    // Prevent multiple rapid clicks or resending while request is in progress
    if (resendOtpMutation.isPending || timer > 0) {
      return;
    }

    setVerificationMessage(null);

    try {
      await resendOtpMutation.mutateAsync(email);

      // Resend successful
      setTimer(60);
      setMessageType('success');
      setVerificationMessage('A new code has been sent to your email');
    } catch (error: any) {
      setMessageType('error');
      setVerificationMessage(
        error.message || 'Failed to resend verification code',
      );
    }
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={true}
      />
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}
        edges={['top']}>
        <Header title="Verification" showBackButton />
        <View style={styles.content}>
          <Text
            style={[styles.title, {color: colors.text}, fontVariants.heading1]}>
            Verify Your Account
          </Text>
          <Text
            style={[styles.subtitle, {color: colors.text}, fontVariants.body]}>
            Enter the 6-digit code sent to {email}
          </Text>

          {verificationMessage && (
            <Text
              style={[
                styles.messageText,
                {
                  color:
                    messageType === 'error' ? colors.error : colors.success,
                },
                fontVariants.bodyBold,
              ]}>
              {verificationMessage}
            </Text>
          )}

          <OtpInput
            name="code"
            control={control}
            error={errors.code?.message}
            onComplete={code => {
              // Auto-submit when all digits are entered
              if (code.length === 6) {
                handleSubmit(onSubmit)();
              }
            }}
          />

          <Button
            title="Verify"
            onPress={handleSubmit(onSubmit)}
            loading={verifyOtpMutation.isPending || loginMutation.isPending}
          />

          <View style={styles.resendContainer}>
            <Text
              style={[
                styles.resendText,
                {color: colors.text},
                fontVariants.body,
              ]}>
              Didn't receive a code?{' '}
              {timer > 0 ? (
                <Text
                  style={[
                    styles.timerText,
                    {color: colors.border},
                    fontVariants.body,
                  ]}>
                  Resend in {timer}s
                </Text>
              ) : (
                <Text
                  style={[
                    styles.resendLinkText,
                    {color: colors.primary},
                    fontVariants.bodyBold,
                  ]}
                  onPress={handleResendCode}>
                  Resend
                </Text>
              )}
            </Text>
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
    textAlign: 'center',
    marginBottom: getResponsiveValue(8),
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: getResponsiveValue(32),
  },
  messageText: {
    marginBottom: getResponsiveValue(16),
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: getResponsiveValue(24),
  },
  resendText: {},
  timerText: {},
  resendLinkText: {},
});

export default VerificationScreen;
