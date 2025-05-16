import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import ProductCard from '../molecules/ProductCard';
import {Product} from '../../types/product';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading = false,
  error = null,
  onRefresh,
  refreshing = false,
}) => {
  const {colors} = useTheme();

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text
          style={[styles.errorText, {color: colors.error}, fontVariants.body]}>
          {error}
        </Text>
      </View>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text
          style={[styles.emptyText, {color: colors.text}, fontVariants.body]}>
          No products found
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={({item}) => <ProductCard product={item} />}
      keyExtractor={item => item._id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: getResponsiveValue(16),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(16),
  },
  errorText: {
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(16),
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default ProductList;
