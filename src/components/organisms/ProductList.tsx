import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  ListRenderItem,
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
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading = false,
  error = null,
  onRefresh,
  refreshing = false,
  onEndReached,
  onEndReachedThreshold,
  ListFooterComponent,
}) => {
  const {colors} = useTheme();

  const renderProduct: ListRenderItem<Product> = ({item}) => (
    <ProductCard product={item} />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, {color: colors.text}, fontVariants.body]}>
        No products found
      </Text>
    </View>
  );

  const renderErrorComponent = () => (
    <View style={styles.errorContainer}>
      <Text
        style={[styles.errorText, {color: colors.error}, fontVariants.body]}>
        {error}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[styles.loadingText, {color: colors.text}, fontVariants.body]}>
          Loading products...
        </Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return renderErrorComponent();
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={item => item._id}
      contentContainerStyle={[
        styles.list,
        products.length === 0 && styles.emptyList,
      ]}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListEmptyComponent={!loading && !error ? renderEmptyComponent : null}
      ListFooterComponent={ListFooterComponent}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      getItemLayout={(data, index) => ({
        length: getResponsiveValue(220), // Approximate item height
        offset: getResponsiveValue(220) * index,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: getResponsiveValue(16),
  },
  emptyList: {
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(20),
  },
  loadingText: {
    marginTop: getResponsiveValue(12),
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
    fontSize: getResponsiveValue(16),
  },
});

export default ProductList;
