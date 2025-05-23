import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigation} from '@react-navigation/native';
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
import {useCreateProduct} from '../../hooks/useProducts';
import {ImageFile} from '../../types/auth';
import {requestCameraPermission} from '../../utils/imagePermissions';

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

const AddProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDarkMode} = useTheme();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const createProductMutation = useCreateProduct();

  const {
    control,
    handleSubmit,
    setValue,
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

  const selectImagesFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
      selectionLimit: 5,
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
      await createProductMutation.mutateAsync({
        title: data.title,
        description: data.description,
        price: data.price,
        location,
        images,
      });

      Alert.alert('Success', 'Product created successfully!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create product');
    }
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={true}
      />
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}>
        <Header title="Add Product" showBackButton={true} />
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
              title="Create Product"
              onPress={handleSubmit(onSubmit)}
              loading={createProductMutation.isPending}
              variant="primary"
            />
          </View>
        </ScrollView>

        <LocationPickerModal
          visible={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onConfirm={handleLocationConfirm}
          title="Select Product Location"
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
  errorText: {
    marginBottom: getResponsiveValue(8),
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

export default AddProductScreen;
