import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';

import AuthForm from '../../components/organisms/AuthForm';
import Header from '../../components/molecules/Header';
import {RegisterFormData, registerSchema} from '../../utils/validation';
import {RootStackParamList} from '../../types/navigation';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import {useSignup} from '../../hooks/useAuth';
import {ImageFile} from '../../types/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({navigation}) => {
  const {colors, isDarkMode} = useTheme();
  const signupMutation = useSignup();
  const [profileImage, setProfileImage] = useState<ImageFile | null>(null);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
    },
  });

  // Function to select image from gallery
  const selectImageFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
    });

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.errorCode) {
      console.log('ImagePicker Error: ', result.errorMessage);
      Alert.alert('Error', 'Failed to pick image');
    } else if (result.assets && result.assets[0]) {
      const selectedImage = result.assets[0];
      setProfileImage({
        uri: selectedImage.uri || '',
        type: selectedImage.type || 'image/jpeg',
        fileName: selectedImage.fileName || 'profile.jpg',
        fileSize: selectedImage.fileSize,
      });
    }
  };

  // Function to take photo with camera
  const takePhotoWithCamera = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
    });

    if (result.didCancel) {
      console.log('User cancelled camera');
    } else if (result.errorCode) {
      console.log('Camera Error: ', result.errorMessage);
      Alert.alert('Error', 'Failed to take photo');
    } else if (result.assets && result.assets[0]) {
      const selectedImage = result.assets[0];
      setProfileImage({
        uri: selectedImage.uri || '',
        type: selectedImage.type || 'image/jpeg',
        fileName: selectedImage.fileName || 'profile.jpg',
        fileSize: selectedImage.fileSize,
      });
    }
  };

  // Show image picker options
  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Profile Photo',
      'Choose how you want to add a profile photo',
      [
        {
          text: 'Take Photo',
          onPress: takePhotoWithCamera,
        },
        {
          text: 'Choose from Gallery',
          onPress: selectImageFromGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signupMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        profileImage: profileImage || undefined,
      });

      // If successful, navigate to verification screen
      navigation.navigate('Verification', {
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      // Error is handled by the mutation
      console.error('Registration error:', error);
    }
  };

  const formFields = [
    {
      name: 'firstName',
      label: 'First Name',
      placeholder: 'Enter your first name',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      placeholder: 'Enter your last name',
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
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={true}
      />
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}
        edges={['top']}>
        <Header title="Create Account" showBackButton />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                {color: colors.text},
                fontVariants.heading1,
              ]}>
              Create Account
            </Text>
            <Text
              style={[
                styles.subtitle,
                {color: colors.text},
                fontVariants.body,
              ]}>
              Sign up to get started
            </Text>

            {/* Profile Image Selection */}
            <View style={styles.imageContainer}>
              <TouchableOpacity
                onPress={showImagePickerOptions}
                style={[
                  styles.imagePickerButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}>
                {profileImage ? (
                  <Image
                    source={{uri: profileImage.uri}}
                    style={styles.profileImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.imagePlaceholder,
                      {backgroundColor: colors.border},
                    ]}>
                    <Text
                      style={[
                        styles.imagePlaceholderText,
                        {color: colors.text},
                      ]}>
                      Add Photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text
                style={[
                  styles.imagePickerText,
                  {color: colors.text},
                  fontVariants.body,
                ]}>
                Profile Picture (Optional)
              </Text>
            </View>

            <AuthForm
              fields={formFields}
              control={control}
              errors={errors}
              onSubmit={handleSubmit(onSubmit)}
              submitButtonText="Register"
              isLoading={signupMutation.isPending}
              errorMessage={signupMutation.error?.message ?? null}
            />

            <View style={styles.footerContainer}>
              <Text
                style={[
                  styles.footerText,
                  {color: colors.text},
                  fontVariants.body,
                ]}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text
                  style={[
                    styles.linkText,
                    {color: colors.primary},
                    fontVariants.bodyBold,
                  ]}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
    marginBottom: getResponsiveValue(16),
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveValue(24),
  },
  imagePickerButton: {
    width: getResponsiveValue(120),
    height: getResponsiveValue(120),
    borderRadius: getResponsiveValue(60),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: getResponsiveValue(8),
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: getResponsiveValue(14),
  },
  imagePickerText: {
    fontSize: getResponsiveValue(14),
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: getResponsiveValue(24),
  },
  footerText: {
    marginRight: getResponsiveValue(4),
  },
  linkText: {},
});

export default RegisterScreen;
