import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types/navigation';
import { Product } from '../../types/product';
import Header from '../../components/molecules/Header';
import Button from '../../components/atoms/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { getResponsiveValue } from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import productsData from '../../data/Products.json';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC<Props> = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchProduct = () => {
      try {
        // Find the product in our data
        const foundProduct = productsData.data.find(p => p._id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleShare = async () => {
    if (product) {
      try {
        await Share.share({
          message: `Check out ${product.title} for $${product.price}!`,
          title: product.title,
        });
      } catch (error) {
        console.error("Error sharing product:", error);
      }
    }
  };

  const handleAddToCart = () => {
    // This would add the product to cart in a real app
    console.log('Add to cart:', product?.title);
  };

  if (loading || !product) {
    return (
      <>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
          translucent={true}
        />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
          <Header title="Loading..." showBackButton />
          <View style={styles.loadingContainer}>
            <Text style={[{ color: colors.text }, fontVariants.body]}>Loading product details...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={true}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title={product.title} showBackButton />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image
            source={{ uri: product.images[0]?.url }}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.contentContainer}>
            <View style={styles.titleRow}>
              <Text 
                style={[
                  styles.title, 
                  { color: colors.text },
                  fontVariants.heading2
                ]}
              >
                {product.title}
              </Text>
              <Text 
                style={[
                  styles.price, 
                  { color: colors.primary },
                  fontVariants.heading2
                ]}
              >
                ${product.price.toFixed(2)}
              </Text>
            </View>

            <Text 
              style={[
                styles.description, 
                { color: colors.text },
                fontVariants.body
              ]}
            >
              {product.description}
            </Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.shareButton, { borderColor: colors.border }]}
                onPress={handleShare}
              >
                <Text 
                  style={[
                    styles.shareButtonText, 
                    { color: colors.text },
                    fontVariants.button
                  ]}
                >
                  Share
                </Text>
              </TouchableOpacity>

              <Button
                title="Add to Cart"
                onPress={handleAddToCart}
                variant="primary"
              />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  image: {
    width: '100%',
    height: getResponsiveValue(300),
  },
  contentContainer: {
    padding: getResponsiveValue(16),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(16),
  },
  title: {
    flex: 1,
    marginRight: getResponsiveValue(8),
  },
  price: {
  },
  description: {
    marginBottom: getResponsiveValue(24),
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    borderWidth: 1,
    borderRadius: getResponsiveValue(8),
    paddingVertical: getResponsiveValue(12),
    paddingHorizontal: getResponsiveValue(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveValue(8),
  },
  shareButtonText: {
  },
});

export default ProductDetailScreen;