import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigation} from '@react-navigation/native';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
} from 'react-native-image-picker';

import Header from '../../components/molecules/Header';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import {profileEditSchema} from '../../utils/validation';
import {useUserProfile, useUpdateProfile} from '../../hooks/useAuth';
import {ImageFile} from '../../types/auth';

interface ProfileEditForm {
  firstName: string;
  lastName: string;
}

const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors} = useTheme();
  const [profileImage, setProfileImage] = useState<ImageFile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Get current user profile
  const {
    data: user,
    isLoading: profileLoading,
    isError: profileError,
    refetch,
  } = useUserProfile();

  // Update profile mutation
  const updateProfileMutation = useUpdateProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<ProfileEditForm>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  // Set form values when user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });

      // Set initial image preview if user has a profile image
      if (user.profileImage?.url) {
        setImagePreview(
          `https://backend-practice.eurisko.me${user.profileImage.url}`,
        );
      }
    }
  }, [user, reset]);

  const selectImageFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
    });

    handleImagePickerResponse(result);
  };

  const takePhotoWithCamera = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
    });

    handleImagePickerResponse(result);
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert('Error', 'Failed to pick image');
    } else if (response.assets && response.assets[0]) {
      const selectedImage = response.assets[0];

      // Set image for form submission
      setProfileImage({
        uri: selectedImage.uri || '',
        type: selectedImage.type || 'image/jpeg',
        fileName: selectedImage.fileName || 'profile.jpg',
        fileSize: selectedImage.fileSize,
      });

      // Set preview
      if (selectedImage.uri) {
        setImagePreview(selectedImage.uri);
      }
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Change Profile Photo',
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

  const onSubmit = async (data: ProfileEditForm) => {
    try {
      await updateProfileMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        profileImage: profileImage || undefined,
      });

      // Refresh user profile data
      await refetch();

      Alert.alert('Success', 'Profile updated successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  if (profileLoading) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}>
        <Header title="Edit Profile" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={[
              styles.loadingText,
              {color: colors.text},
              fontVariants.body,
            ]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (profileError) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}>
        <Header title="Edit Profile" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Text
            style={[
              styles.errorText,
              {color: colors.error},
              fontVariants.body,
            ]}>
            Failed to load profile. Please try again.
          </Text>
          <Button title="Try Again" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title="Edit Profile" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={showImagePickerOptions}
            activeOpacity={0.8}>
            {imagePreview ? (
              <Image source={{uri: imagePreview}} style={styles.profileImage} />
            ) : (
              <View
                style={[
                  styles.placeholderImage,
                  {backgroundColor: colors.border},
                ]}>
                <Text style={[styles.placeholderText, {color: colors.text}]}>
                  {user?.firstName?.charAt(0) || ''}
                  {user?.lastName?.charAt(0) || ''}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.changePhotoButton,
                {backgroundColor: colors.primary},
              ]}>
              <Text
                style={[
                  styles.changePhotoText,
                  {color: colors.card},
                  fontVariants.caption,
                ]}>
                Change
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.form}>
            <Text
              style={[
                styles.label,
                {color: colors.text},
                fontVariants.bodyBold,
              ]}>
              First Name
            </Text>
            <Controller
              control={control}
              name="firstName"
              render={({field: {onChange, onBlur, value}}) => (
                <Input
                  name="firstName"
                  control={control}
                  label=""
                  placeholder="Enter your first name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.firstName?.message}
                />
              )}
            />

            <Text
              style={[
                styles.label,
                {color: colors.text},
                fontVariants.bodyBold,
              ]}>
              Last Name
            </Text>
            <Controller
              control={control}
              name="lastName"
              render={({field: {onChange, onBlur, value}}) => (
                <Input
                  name="lastName"
                  control={control}
                  label=""
                  placeholder="Enter your last name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.lastName?.message}
                />
              )}
            />

            <Button
              title="Save Changes"
              onPress={handleSubmit(onSubmit)}
              loading={updateProfileMutation.isPending}
            />
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
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: getResponsiveValue(32),
  },
  profileImage: {
    width: getResponsiveValue(150),
    height: getResponsiveValue(150),
    borderRadius: getResponsiveValue(75),
  },
  placeholderImage: {
    width: getResponsiveValue(150),
    height: getResponsiveValue(150),
    borderRadius: getResponsiveValue(75),
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: getResponsiveValue(40),
    fontWeight: 'bold',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: getResponsiveValue(12),
    paddingVertical: getResponsiveValue(6),
    borderRadius: getResponsiveValue(20),
  },
  changePhotoText: {
    color: '#fff',
    fontSize: getResponsiveValue(12),
  },
  form: {
    width: '100%',
  },
  label: {
    marginBottom: getResponsiveValue(8),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(20),
  },
  loadingText: {
    marginTop: getResponsiveValue(16),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(20),
  },
  errorText: {
    marginBottom: getResponsiveValue(16),
    textAlign: 'center',
  },
});

export default ProfileEditScreen;
