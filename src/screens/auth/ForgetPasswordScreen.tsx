import React from 'react';
import {View, Text, StyleSheet, StatusBar, Alert} from 'react-native';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {z} from 'zod';

import AuthForm from '../../components/organisms/AuthForm';
import {RootStackParamList} from '../../types/navigation';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import Header from '../../components/molecules/Header';
import {useForgotPassword} from '../../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

// Create a schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordScreen: React.FC<Props> = ({navigation}) => {
  const {colors, isDarkMode} = useTheme();
  const forgotPasswordMutation = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email);

      // Alert user of success
      Alert.alert(
        'Email Sent',
        'Password reset email sent successfully. Please check your inbox.',
        [{text: 'OK', onPress: () => navigation.navigate('Login')}],
      );
    } catch (error) {
      // Error handling is done by the mutation
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
  ];

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
        <Header
          title="Forgot Password"
          showBackButton={true}
          showThemeToggle={true}
        />

        <View style={styles.content}>
          <Text
            style={[styles.title, {color: colors.text}, fontVariants.heading1]}>
            Reset Password
          </Text>
          <Text
            style={[styles.subtitle, {color: colors.text}, fontVariants.body]}>
            Enter your email to receive a password reset link
          </Text>

          <AuthForm
            fields={formFields}
            control={control}
            errors={errors}
            onSubmit={handleSubmit(onSubmit)}
            submitButtonText="Send Reset Link"
            isLoading={forgotPasswordMutation.isPending}
            errorMessage={forgotPasswordMutation.error?.message ?? null}
          />
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
});

export default ForgotPasswordScreen;
