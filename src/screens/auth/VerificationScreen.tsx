import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import OtpInput from '../../components/atoms/OtpInput';
import Button from '../../components/atoms/Button';
import Header from '../../components/molecules/Header';
import {VerificationFormData, verificationSchema} from '../../utils/validation';
import {RootStackParamList} from '../../types/navigation';
import {useAuth} from '../../contexts/AuthContext';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'Verification'>;

const VerificationScreen: React.FC<Props> = ({route}) => {
  const {email} = route.params;
  const {verify, isLoading} = useAuth();
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [timer, setTimer] = useState<number>(60);
  const {colors, isDarkMode} = useTheme();

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

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const onSubmit = async (data: VerificationFormData) => {
    setVerificationError(null);
    const success = await verify(data.code);

    if (!success) {
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
            Enter the 4-digit code sent to {email}
          </Text>

          {verificationError && (
            <Text
              style={[
                styles.messageText,
                verificationError.includes('Invalid')
                  ? {color: colors.error}
                  : {color: colors.success},
                fontVariants.bodyBold,
              ]}>
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
                  onPress={resendCode}>
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
