import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import Header from '../../components/molecules/Header';
import ProductList from '../../components/organisms/ProductList';
import { Product } from '../../types/product';
import { useTheme } from '../../contexts/ThemeContext';
import productsData from '../../data/Products.json';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

const ProductListScreen: React.FC<Props> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { colors, isDarkMode } = useTheme();

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
        console.error("Error fetching products:", error);
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

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Products" showBackButton={false} showThemeToggle={true} />
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
});

export default ProductListScreen;