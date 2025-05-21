import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import Header from '../../components/molecules/Header';
import Button from '../../components/atoms/Button';
import {useAuthStore} from '../../store/authStore';
import {useUserProfile} from '../../hooks/useAuth';

const ProfileScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {colors} = useTheme();
  const {logout} = useAuthStore();
  const {data: user, isLoading, isError, error, refetch} = useUserProfile();

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to log out. Please try again.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}>
        <Header title="Profile" showBackButton={false} />
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

  if (isError) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}>
        <Header title="Profile" showBackButton={false} />
        <View style={styles.errorContainer}>
          <Text
            style={[
              styles.errorText,
              {color: colors.error},
              fontVariants.body,
            ]}>
            {error instanceof Error ? error.message : 'Failed to load profile'}
          </Text>
          <Button title="Try Again" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title="Profile" showBackButton={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image
                source={{
                  uri: `https://backend-practice.eurisko.me${user.profileImage.url}`,
                }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.placeholderAvatar,
                  {backgroundColor: colors.border},
                ]}>
                <Text style={[styles.placeholderText, {color: colors.text}]}>
                  {user?.firstName?.charAt(0) || ''}
                  {user?.lastName?.charAt(0) || ''}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[styles.name, {color: colors.text}, fontVariants.heading2]}>
            {user?.firstName} {user?.lastName}
          </Text>

          <Text style={[styles.email, {color: colors.text}, fontVariants.body]}>
            {user?.email}
          </Text>

          <View style={styles.buttons}>
            <Button
              title="Edit Profile"
              onPress={handleEditProfile}
              variant="primary"
            />

            <Button title="Logout" onPress={handleLogout} variant="outline" />
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
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    padding: getResponsiveValue(24),
  },
  avatarContainer: {
    marginBottom: getResponsiveValue(20),
  },
  avatar: {
    width: getResponsiveValue(150),
    height: getResponsiveValue(150),
    borderRadius: getResponsiveValue(75),
  },
  placeholderAvatar: {
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
  name: {
    marginBottom: getResponsiveValue(8),
    textAlign: 'center',
  },
  email: {
    marginBottom: getResponsiveValue(24),
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
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

export default ProfileScreen;
