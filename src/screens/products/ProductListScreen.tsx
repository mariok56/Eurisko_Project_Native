import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/molecules/Header';
import ProductList from '../../components/organisms/ProductList';
import {Product} from '../../types/product';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import productsData from '../../data/Products.json';
import {useAuthStore} from '../../store/authStore';

// Using FC without props, will use useNavigation hook instead
const ProductListScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const {colors, isDarkMode} = useTheme();
  const {logout} = useAuthStore();
  // Using navigation hook instead of props

  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.background);
    }

    // Simulate API call
    const fetchProducts = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setProducts(productsData.data);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [colors.background, isDarkMode]);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setProducts(productsData.data);
      setLoading(false);
    }, 1000);
  };

  // Handle logout with confirmation
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
            // The navigation will automatically redirect to login screen
            // because the isAuthenticated state will be false
          } catch (error) {
            console.error('Error logging out:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  // Create a logout button component
  const LogoutButton = () => (
    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
      <Text
        style={[
          styles.logoutText,
          {color: colors.primary},
          fontVariants.button,
        ]}>
        Logout
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}
        edges={['top']}>
        <Header
          title="Products"
          showBackButton={false}
          showThemeToggle={false}
          rightComponent={<LogoutButton />}
        />
        <View style={styles.content}>
          <ProductList
            products={products}
            loading={loading}
            onRefresh={handleRefresh}
            refreshing={loading}
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
  },
  logoutButton: {
    paddingHorizontal: getResponsiveValue(8),
    paddingVertical: getResponsiveValue(4),
  },
  logoutText: {
    fontSize: getResponsiveValue(16),
    fontWeight: '600',
  },
});

export default ProductListScreen;
