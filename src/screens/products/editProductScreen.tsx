import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {z} from 'zod';

import Header from '../../components/molecules/Header';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Icon from '../../components/atoms/icons';
import LocationPickerModal from '../../components/molecules/LocationPickerModal';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import {productSchema, ProductFormData} from '../../utils/validation';
import {useProduct, useUpdateProduct} from '../../hooks/useProducts';
import {ImageFile} from '../../types/auth';
import {requestCameraPermission} from '../../utils/imagePermissions';
import {RootStackParamList} from '../../types/navigation';

interface LocationData {
  name: string;
  longitude: number;
  latitude: number;
}

interface ExtendedProductForm extends ProductFormData {
  locationName: string;
}

const extendedProductSchema = productSchema.extend({
  locationName: z
    .string()
    .min(3, 'Location name must be at least 3 characters'),
});

type Props = NativeStackScreenProps<RootStackParamList, 'EditProduct'>;

const EditProductScreen: React.FC<Props> = ({route, navigation}) => {
  const {productId} = route.params;
  const {colors, isDarkMode} = useTheme();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
  } = useProduct(productId);
  const updateProductMutation = useUpdateProduct();

  const product = productData?.product;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: {errors},
  } = useForm<ExtendedProductForm>({
    resolver: zodResolver(extendedProductSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      locationName: '',
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        description: product.description,
        price: product.price,
        locationName: product.location?.name || '',
      });

      if (product.location) {
        setLocation({
          name: product.location.name,
          latitude: product.location.latitude,
          longitude: product.location.longitude,
        });
      }

      if (product.images) {
        const existingImages: ImageFile[] = product.images.map(
          (image, index) => ({
            uri: `https://backend-practice.eurisko.me${image.url}`,
            type: 'image/jpeg',
            fileName: `existing_image_${index}.jpg`,
            isExisting: true,
          }),
        );
        setImages(existingImages);
      }
    }
  }, [product, reset]);

  const selectImagesFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
      selectionLimit: 5 - images.length,
    });

    if (result.assets) {
      const newImages: ImageFile[] = result.assets.map((asset, index) => ({
        uri: asset.uri || '',
        type: asset.type || 'image/jpeg',
        fileName: asset.fileName || `image_${index}.jpg`,
        fileSize: asset.fileSize,
      }));
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }

    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    });

    if (result.assets && result.assets[0]) {
      const newImage: ImageFile = {
        uri: result.assets[0].uri || '',
        type: result.assets[0].type || 'image/jpeg',
        fileName: result.assets[0].fileName || 'photo.jpg',
        fileSize: result.assets[0].fileSize,
      };
      setImages(prev => [...prev, newImage].slice(0, 5));
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Add Product Images',
      'Choose how you want to add product images',
      [
        {text: 'Take Photo', onPress: takePhotoWithCamera},
        {text: 'Choose from Gallery', onPress: selectImagesFromGallery},
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const selectLocation = () => {
    setShowLocationModal(true);
  };

  const handleLocationConfirm = (locationData: LocationData) => {
    setLocation(locationData);
    setValue('locationName', locationData.name);
  };

  const onSubmit = async (data: ExtendedProductForm) => {
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one product image.');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Please select a location.');
      return;
    }

    try {
      const newImages = images.filter(img => !(img as any).isExisting);

      await updateProductMutation.mutateAsync({
        id: productId,
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          location,
          images: newImages.length > 0 ? newImages : undefined,
        },
      });

      Alert.alert('Success', 'Product updated successfully!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update product');
    }
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
          style={[styles.container, {backgroundColor: colors.background}]}>
          <Header title="Edit Product" showBackButton={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[
                styles.loadingText,
                {color: colors.text},
                fontVariants.body,
              ]}>
              Loading product...
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
          style={[styles.container, {backgroundColor: colors.background}]}>
          <Header title="Edit Product" showBackButton={true} />
          <View style={styles.errorContainer}>
            <Text
              style={[
                styles.errorText,
                {color: colors.error},
                fontVariants.body,
              ]}>
              {productError?.message || 'Product not found'}
            </Text>
            <Button title="Go Back" onPress={() => navigation.goBack()} />
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
        style={[styles.container, {backgroundColor: colors.background}]}>
        <Header title="Edit Product" showBackButton={true} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text
              style={[
                styles.label,
                {color: colors.text},
                fontVariants.bodyBold,
              ]}>
              Product Title *
            </Text>
            <Input
              name="title"
              control={control}
              label=""
              placeholder="Enter product title"
              error={errors.title?.message}
            />

            <Text
              style={[
                styles.label,
                {color: colors.text},
                fontVariants.bodyBold,
              ]}>
              Description *
            </Text>
            <Input
              name="description"
              control={control}
              label=""
              placeholder="Describe your product"
              multiline
              numberOfLines={4}
              style={styles.textArea}
              error={errors.description?.message}
            />

            <Text
              style={[
                styles.label,
                {color: colors.text},
                fontVariants.bodyBold,
              ]}>
              Price *
            </Text>
            <Controller
              control={control}
              name="price"
              render={({field: {onChange, value}}) => (
                <Input
                  name="price"
                  control={control}
                  label=""
                  placeholder="Enter price"
                  keyboardType="numeric"
                  value={value?.toString() || ''}
                  onChangeText={text => {
                    const numericValue = parseFloat(text) || 0;
                    onChange(numericValue);
                  }}
                  error={errors.price?.message}
                />
              )}
            />

            <Text
              style={[
                styles.label,
                {color: colors.text},
                fontVariants.bodyBold,
              ]}>
              Location *
            </Text>
            <TouchableOpacity
              style={[
                styles.locationButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={selectLocation}>
              <Icon name="location-on" size={20} color={colors.primary} />
              <Text
                style={[
                  styles.locationText,
                  {color: location ? colors.text : colors.border},
                  fontVariants.body,
                ]}>
                {location ? location.name : 'Tap to select location on map'}
              </Text>
              <Icon
                name="keyboard-arrow-down"
                size={20}
                color={colors.border}
              />
            </TouchableOpacity>
            {errors.locationName && (
              <Text
                style={[
                  styles.errorText,
                  {color: colors.error},
                  fontVariants.caption,
                ]}>
                {errors.locationName.message}
              </Text>
            )}

            <Text
              style={[
                styles.label,
                {color: colors.text},
                fontVariants.bodyBold,
              ]}>
              Product Images * (Max 5)
            </Text>
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{uri: image.uri}}
                    style={styles.productImage}
                  />
                  <TouchableOpacity
                    style={[
                      styles.removeImageButton,
                      {backgroundColor: colors.error},
                    ]}
                    onPress={() => removeImage(index)}>
                    <Icon name="clear" size={16} color={colors.card} />
                  </TouchableOpacity>
                  {(image as any).isExisting && (
                    <View
                      style={[
                        styles.existingImageBadge,
                        {backgroundColor: colors.success},
                      ]}>
                      <Text
                        style={[
                          styles.existingImageText,
                          {color: colors.card},
                        ]}>
                        Current
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity
                  style={[
                    styles.addImageButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={showImagePickerOptions}>
                  <Icon name="add" size={30} color={colors.primary} />
                  <Text
                    style={[
                      styles.addImageText,
                      {color: colors.text},
                      fontVariants.caption,
                    ]}>
                    Add Image
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Button
              title="Update Product"
              onPress={handleSubmit(onSubmit)}
              loading={updateProductMutation.isPending}
              variant="primary"
            />
          </View>
        </ScrollView>

        <LocationPickerModal
          visible={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onConfirm={handleLocationConfirm}
          initialLocation={location}
          title="Update Product Location"
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: getResponsiveValue(16),
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
  label: {
    marginBottom: getResponsiveValue(8),
    marginTop: getResponsiveValue(8),
  },
  textArea: {
    height: getResponsiveValue(100),
    textAlignVertical: 'top',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveValue(12),
    borderRadius: getResponsiveValue(8),
    borderWidth: 1,
    marginBottom: getResponsiveValue(8),
  },
  locationText: {
    marginLeft: getResponsiveValue(8),
    flex: 1,
  },

  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: getResponsiveValue(16),
  },
  imageWrapper: {
    position: 'relative',
    marginRight: getResponsiveValue(8),
    marginBottom: getResponsiveValue(8),
  },
  productImage: {
    width: getResponsiveValue(80),
    height: getResponsiveValue(80),
    borderRadius: getResponsiveValue(8),
  },
  removeImageButton: {
    position: 'absolute',
    top: -getResponsiveValue(8),
    right: -getResponsiveValue(8),
    width: getResponsiveValue(24),
    height: getResponsiveValue(24),
    borderRadius: getResponsiveValue(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  existingImageBadge: {
    position: 'absolute',
    bottom: -getResponsiveValue(4),
    left: 0,
    right: 0,
    paddingVertical: getResponsiveValue(2),
    borderBottomLeftRadius: getResponsiveValue(8),
    borderBottomRightRadius: getResponsiveValue(8),
    alignItems: 'center',
  },
  existingImageText: {
    fontSize: getResponsiveValue(10),
    fontWeight: '600',
  },
  addImageButton: {
    width: getResponsiveValue(80),
    height: getResponsiveValue(80),
    borderRadius: getResponsiveValue(8),
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    marginTop: getResponsiveValue(4),
    textAlign: 'center',
  },
});

export default EditProductScreen;
