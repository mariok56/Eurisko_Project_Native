import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
  Dimensions,
  Image,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from '../../components/atoms/icons'; // Custom icon component

import {RootStackParamList} from '../../types/navigation';
import Header from '../../components/molecules/Header';
import Button from '../../components/atoms/Button';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import {useProduct, useDeleteProduct} from '../../hooks/useProducts';
import {useUserProfile} from '../../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const {width: screenWidth} = Dimensions.get('window');

const ProductDetailScreen: React.FC<Props> = ({route, navigation}) => {
  const {productId} = route.params;
  const {colors, isDarkMode} = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // API hooks
  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
    refetch,
  } = useProduct(productId);

  const {data: currentUser} = useUserProfile();
  const deleteProductMutation = useDeleteProduct();

  const product = productData?.product;
  const isOwner = product?.user?._id === currentUser?.id;

  const handleShare = async () => {
    if (product) {
      try {
        await Share.share({
          message: `Check out ${product.title} for $${product.price}!\n\n${product.description}`,
          title: product.title,
        });
      } catch (error) {
        console.error('Error sharing product:', error);
      }
    }
  };

  const handleContactOwner = async () => {
    if (product?.user?.email) {
      const subject = `Inquiry about ${product.title}`;
      const body = `Hi,\n\nI'm interested in your product "${product.title}" listed for $${product.price}.\n\nPlease let me know if it's still available.\n\nThanks!`;
      const emailUrl = `mailto:${
        product.user.email
      }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body,
      )}`;

      try {
        const supported = await Linking.canOpenURL(emailUrl);
        if (supported) {
          await Linking.openURL(emailUrl);
        } else {
          Alert.alert(
            'Email Not Available',
            'Unable to open email app. Please contact the owner manually.',
          );
        }
      } catch (error) {
        console.error('Error opening email:', error);
        Alert.alert('Error', 'Failed to open email app.');
      }
    }
  };

  const handleEditProduct = () => {
    navigation.navigate('EditProduct', {productId: product!._id});
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProductMutation.mutateAsync(productId);
              Alert.alert('Success', 'Product deleted successfully', [
                {text: 'OK', onPress: () => navigation.goBack()},
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete product');
            }
          },
        },
      ],
    );
  };

  const renderImageGallery = () => {
    if (!product?.images || product.images.length === 0) {
      return (
        <View
          style={[styles.imagePlaceholder, {backgroundColor: colors.border}]}>
          <Icon name="image" size={50} color={colors.text} />
          <Text style={[styles.noImageText, {color: colors.text}]}>
            No Image
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={({nativeEvent}) => {
            const newIndex = Math.round(
              nativeEvent.contentOffset.x / screenWidth,
            );
            setCurrentImageIndex(newIndex);
          }}
          scrollEventThrottle={16}>
          {product.images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image
                source={{
                  uri: `https://backend-practice.eurisko.me${image.url}`,
                }}
                style={styles.image}
                resizeMode="cover"
                onError={() => console.log('Error loading image:', image.url)}
              />
            </View>
          ))}
        </ScrollView>

        {product.images.length > 1 && (
          <View style={styles.imageIndicator}>
            <Text style={[styles.indicatorText, {color: colors.card}]}>
              {currentImageIndex + 1} / {product.images.length}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (productLoading) {
    return (
      <>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
          translucent={true}
        />
        <SafeAreaView
          style={[styles.container, {backgroundColor: colors.background}]}
          edges={['top']}>
          <Header title="Loading..." showBackButton />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[
                styles.loadingText,
                {color: colors.text},
                fontVariants.body,
              ]}>
              Loading product details...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (productError || !product) {
    return (
      <>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
          translucent={true}
        />
        <SafeAreaView
          style={[styles.container, {backgroundColor: colors.background}]}
          edges={['top']}>
          <Header title="Error" showBackButton />
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={50} color={colors.error} />
            <Text
              style={[
                styles.errorText,
                {color: colors.error},
                fontVariants.body,
              ]}>
              {productError?.message || 'Product not found'}
            </Text>
            <Button title="Try Again" onPress={() => refetch()} />
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
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}
        edges={['top']}>
        <Header title={product.title} showBackButton />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderImageGallery()}

          <View style={styles.contentContainer}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.title,
                  {color: colors.text},
                  fontVariants.heading2,
                ]}>
                {product.title}
              </Text>
              <Text
                style={[
                  styles.price,
                  {color: colors.primary},
                  fontVariants.heading2,
                ]}>
                ${product.price.toFixed(2)}
              </Text>
            </View>

            <Text
              style={[
                styles.description,
                {color: colors.text},
                fontVariants.body,
              ]}>
              {product.description}
            </Text>

            {/* Location */}
            {product.location && (
              <View style={styles.locationSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {color: colors.text},
                    fontVariants.bodyBold,
                  ]}>
                  Location
                </Text>
                <View style={styles.locationRow}>
                  <Icon name="location-on" size={20} color={colors.primary} />
                  <Text
                    style={[
                      styles.locationText,
                      {color: colors.text},
                      fontVariants.body,
                    ]}>
                    {product.location.name}
                  </Text>
                </View>
              </View>
            )}

            {/* Owner Information */}
            {product.user && (
              <View style={styles.ownerSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {color: colors.text},
                    fontVariants.bodyBold,
                  ]}>
                  Seller Information
                </Text>
                <View style={styles.ownerInfo}>
                  <View style={styles.ownerDetails}>
                    <Text
                      style={[
                        styles.ownerName,
                        {color: colors.text},
                        fontVariants.bodyBold,
                      ]}>
                      {product.user.firstName} {product.user.lastName}
                    </Text>
                    <Text
                      style={[
                        styles.ownerEmail,
                        {color: colors.border},
                        fontVariants.body,
                      ]}>
                      {product.user.email}
                    </Text>
                  </View>
                  {!isOwner && (
                    <TouchableOpacity
                      style={[
                        styles.contactButton,
                        {backgroundColor: colors.primary},
                      ]}
                      onPress={handleContactOwner}>
                      <Icon name="email" size={20} color={colors.card} />
                      <Text
                        style={[
                          styles.contactButtonText,
                          {color: colors.card},
                          fontVariants.button,
                        ]}>
                        Contact
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              {isOwner ? (
                <View style={styles.ownerButtons}>
                  <TouchableOpacity
                    style={[
                      styles.editButton,
                      {backgroundColor: colors.primary},
                    ]}
                    onPress={handleEditProduct}>
                    <Icon name="edit" size={20} color={colors.card} />
                    <Text
                      style={[
                        styles.buttonText,
                        {color: colors.card},
                        fontVariants.button,
                      ]}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      {backgroundColor: colors.error},
                    ]}
                    onPress={handleDeleteProduct}
                    disabled={deleteProductMutation.isPending}>
                    {deleteProductMutation.isPending ? (
                      <ActivityIndicator size="small" color={colors.card} />
                    ) : (
                      <Icon name="delete" size={20} color={colors.card} />
                    )}
                    <Text
                      style={[
                        styles.buttonText,
                        {color: colors.card},
                        fontVariants.button,
                      ]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.shareButton, {borderColor: colors.border}]}
                  onPress={handleShare}>
                  <Icon name="share" size={20} color={colors.text} />
                  <Text
                    style={[
                      styles.shareButtonText,
                      {color: colors.text},
                      fontVariants.button,
                    ]}>
                    Share
                  </Text>
                </TouchableOpacity>
              )}
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
    padding: getResponsiveValue(20),
  },
  loadingText: {
    marginTop: getResponsiveValue(12),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(20),
  },
  errorText: {
    marginVertical: getResponsiveValue(16),
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  imageWrapper: {
    width: screenWidth,
    height: getResponsiveValue(300),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: screenWidth,
    height: getResponsiveValue(300),
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: getResponsiveValue(8),
  },
  imageIndicator: {
    position: 'absolute',
    bottom: getResponsiveValue(16),
    right: getResponsiveValue(16),
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: getResponsiveValue(12),
    paddingVertical: getResponsiveValue(6),
    borderRadius: getResponsiveValue(12),
  },
  indicatorText: {
    fontSize: getResponsiveValue(14),
    fontWeight: '600',
  },
  contentContainer: {
    padding: getResponsiveValue(16),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: getResponsiveValue(16),
  },
  title: {
    flex: 1,
    marginRight: getResponsiveValue(16),
  },
  price: {},
  description: {
    marginBottom: getResponsiveValue(24),
    lineHeight: getResponsiveValue(22),
  },
  locationSection: {
    marginBottom: getResponsiveValue(24),
  },
  sectionTitle: {
    marginBottom: getResponsiveValue(8),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: getResponsiveValue(8),
  },
  ownerSection: {
    marginBottom: getResponsiveValue(24),
  },
  ownerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    marginBottom: getResponsiveValue(4),
  },
  ownerEmail: {},
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveValue(16),
    paddingVertical: getResponsiveValue(8),
    borderRadius: getResponsiveValue(8),
  },
  contactButtonText: {
    marginLeft: getResponsiveValue(8),
  },
  buttonsContainer: {
    marginTop: getResponsiveValue(16),
  },
  ownerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveValue(12),
    borderRadius: getResponsiveValue(8),
    marginRight: getResponsiveValue(8),
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveValue(12),
    borderRadius: getResponsiveValue(8),
    marginLeft: getResponsiveValue(8),
  },
  buttonText: {
    marginLeft: getResponsiveValue(8),
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveValue(12),
    borderRadius: getResponsiveValue(8),
    borderWidth: 1,
  },
  shareButtonText: {},
});

export default ProductDetailScreen;
