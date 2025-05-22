import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from '../../components/atoms/icons';

import Header from '../../components/molecules/Header';
import ProductList from '../../components/organisms/ProductList';
import {
  ProductsHeaderRight,
  LoadingMoreComponent,
} from '../../components/molecules/HeaderComponents';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import {useProducts, useSearchProducts} from '../../hooks/useProducts';
import {ProductFilter} from '../../types/product';
import {RootStackParamList} from '../../types/navigation';

const ProductListScreen: React.FC = () => {
  const {colors, isDarkMode} = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Prepare filters
  const filters: ProductFilter = {
    page: currentPage,
    limit: 10,
    sortBy,
    order: sortOrder,
  };

  // Use appropriate hook based on whether we're searching or not
  const productsQuery = useProducts(searchQuery ? {} : filters);
  const searchQuery_trimmed = searchQuery.trim();
  const searchProductsQuery = useSearchProducts(searchQuery_trimmed);

  // Decide which query to use
  const activeQuery = searchQuery_trimmed ? searchProductsQuery : productsQuery;
  const products = activeQuery.data?.products || [];
  const pagination = productsQuery.data?.pagination;

  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.background);
    }
  }, [colors.background, isDarkMode]);

  const handleRefresh = useCallback(() => {
    if (searchQuery_trimmed) {
      searchProductsQuery.refetch();
    } else {
      productsQuery.refetch();
    }
  }, [searchQuery_trimmed, searchProductsQuery, productsQuery]);

  const handleSortToggle = useCallback(() => {
    if (sortBy === 'price') {
      setSortBy('createdAt');
      setSortOrder('desc');
    } else {
      setSortBy('price');
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [sortBy, sortOrder]);

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNextPage && !activeQuery.isFetching) {
      setCurrentPage(prev => prev + 1);
    }
  }, [pagination?.hasNextPage, activeQuery.isFetching]);

  const handleAddProduct = useCallback(() => {
    navigation.navigate('AddProduct');
  }, [navigation]);

  // Memoized LoadingMore component to prevent unnecessary re-renders
  const showLoadingMore =
    !searchQuery_trimmed && pagination?.hasNextPage && activeQuery.isFetching;

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
          showThemeToggle={true}
          rightComponent={
            <ProductsHeaderRight onAddProduct={handleAddProduct} />
          }
        />

        {/* Search and Filter Section */}
        <View style={[styles.searchSection, {backgroundColor: colors.card}]}>
          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchContainer,
                {backgroundColor: colors.background},
              ]}>
              <Icon
                name="search"
                size={20}
                color={colors.border}
                style={styles.searchIcon}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  {color: colors.text},
                  fontVariants.body,
                ]}
                placeholder="Search products..."
                placeholderTextColor={colors.border}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}>
                  <Icon name="clear" size={20} color={colors.border} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.sortButton, {borderColor: colors.border}]}
              onPress={handleSortToggle}>
              <Icon
                name={sortBy === 'price' ? 'attach-money' : 'schedule'}
                size={20}
                color={colors.primary}
              />
              <Icon
                name={
                  sortOrder === 'asc'
                    ? 'keyboard-arrow-up'
                    : 'keyboard-arrow-down'
                }
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {searchQuery_trimmed && (
            <Text
              style={[
                styles.searchInfo,
                {color: colors.text},
                fontVariants.caption,
              ]}>
              {searchProductsQuery.isLoading
                ? 'Searching...'
                : `Found ${products.length} result(s) for "${searchQuery_trimmed}"`}
            </Text>
          )}
        </View>

        <View style={styles.content}>
          <ProductList
            products={products}
            loading={activeQuery.isLoading && !activeQuery.isFetching}
            error={activeQuery.error?.message || null}
            onRefresh={handleRefresh}
            refreshing={activeQuery.isFetching}
            onEndReached={!searchQuery_trimmed ? handleLoadMore : undefined}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() => (
              <LoadingMoreComponent visible={showLoadingMore || false} />
            )}
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
  searchSection: {
    paddingHorizontal: getResponsiveValue(16),
    paddingVertical: getResponsiveValue(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: getResponsiveValue(8),
    paddingHorizontal: getResponsiveValue(12),
    height: getResponsiveValue(40),
    marginRight: getResponsiveValue(12),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  searchIcon: {
    marginRight: getResponsiveValue(8),
  },
  searchInput: {
    flex: 1,
    fontSize: getResponsiveValue(16),
    padding: 0,
  },
  clearButton: {
    padding: getResponsiveValue(4),
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveValue(12),
    paddingVertical: getResponsiveValue(8),
    borderRadius: getResponsiveValue(8),
    borderWidth: 1,
  },
  searchInfo: {
    marginTop: getResponsiveValue(8),
  },
});

export default ProductListScreen;
