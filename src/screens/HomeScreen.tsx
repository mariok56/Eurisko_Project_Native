import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/atoms/Button';
import Header from '../components/molecules/Header';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../types/navigation';
import { getResponsiveValue } from '../utils/responsive';
import fontVariants from '../assets/fonts/fonts';

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const navigateToProducts = () => {
    navigation.navigate('ProductList');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Home" showBackButton={false} />
      
      <View style={styles.content}>
        <Text 
          style={[
            styles.title, 
            { color: colors.text },
            fontVariants.heading1
          ]}
        >
          Welcome, {user?.name || 'User'}!
        </Text>
        <Text 
          style={[
            styles.subtitle, 
            { color: colors.text },
            fontVariants.body
          ]}
        >
          You have successfully logged in.
        </Text>

        <View 
          style={[
            styles.infoContainer, 
            { 
              backgroundColor: colors.card, 
              borderColor: colors.border 
            }
          ]}
        >
          <Text 
            style={[
              styles.infoTitle, 
              { color: colors.text },
              fontVariants.heading3
            ]}
          >
            Your Information:
          </Text>
          <View style={styles.infoItem}>
            <Text 
              style={[
                styles.infoLabel, 
                { color: colors.text },
                fontVariants.bodyBold
              ]}
            >
              Name:
            </Text>
            <Text 
              style={[
                styles.infoValue, 
                { color: colors.text },
                fontVariants.body
              ]}
            >
              {user?.name}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text 
              style={[
                styles.infoLabel, 
                { color: colors.text },
                fontVariants.bodyBold
              ]}
            >
              Email:
            </Text>
            <Text 
              style={[
                styles.infoValue, 
                { color: colors.text },
                fontVariants.body
              ]}
            >
              {user?.email}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text 
              style={[
                styles.infoLabel, 
                { color: colors.text },
                fontVariants.bodyBold
              ]}
            >
              Phone:
            </Text>
            <Text 
              style={[
                styles.infoValue, 
                { color: colors.text },
                fontVariants.body
              ]}
            >
              {user?.phoneNumber}
            </Text>
          </View>
        </View>

        <Button 
          title="Browse Products" 
          onPress={navigateToProducts} 
          variant="primary" 
        />
        
        <View style={styles.buttonSpacer} />
        
        <Button 
          title="Logout" 
          onPress={logout} 
          variant="outline" 
        />
      </View>
    </SafeAreaView>
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
  infoContainer: {
    borderRadius: getResponsiveValue(12),
    padding: getResponsiveValue(16),
    marginBottom: getResponsiveValue(32),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: getResponsiveValue(2) },
    shadowOpacity: 0.1,
    shadowRadius: getResponsiveValue(4),
    elevation: 3,
    borderWidth: 1,
  },
  infoTitle: {
    marginBottom: getResponsiveValue(16),
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: getResponsiveValue(12),
  },
  infoLabel: {
    width: getResponsiveValue(80),
  },
  infoValue: {
    flex: 1,
  },
  buttonSpacer: {
    height: getResponsiveValue(12),
  },
});

export default HomeScreen;