import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Product } from '../../types/product';
import { useTheme } from '../../contexts/ThemeContext';
import { getResponsiveValue } from '../../utils/responsive';
import fontVariants from '../../utils/fonts';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const handlePress = () => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: product.images[0]?.url }} 
        style={styles.image} 
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text 
          style={[
            styles.title, 
            { color: colors.text },
            fontVariants.bodyBold
          ]} 
          numberOfLines={1}
        >
          {product.title}
        </Text>
        <Text 
          style={[
            styles.price, 
            { color: colors.primary },
            fontVariants.heading3
          ]}
        >
          ${product.price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: getResponsiveValue(12),
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: getResponsiveValue(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: getResponsiveValue(2) },
    shadowOpacity: 0.1,
    shadowRadius: getResponsiveValue(4),
    elevation: 2,
  },
  image: {
    width: '100%',
    height: getResponsiveValue(180),
  },
  infoContainer: {
    padding: getResponsiveValue(12),
  },
  title: {
    marginBottom: getResponsiveValue(8),
  },
  price: {
    
  }
});

export default ProductCard;