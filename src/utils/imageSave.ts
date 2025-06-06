import {Platform, PermissionsAndroid, Alert} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';

export const requestPhotoLibraryPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const androidVersion = Platform.Version;

      if (androidVersion >= 33) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);

        return (
          granted['android.permission.READ_MEDIA_IMAGES'] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.READ_MEDIA_VIDEO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'We need access to save images to your device.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  }
  return true;
};

export const saveImageToDevice = async (imageUrl: string): Promise<boolean> => {
  try {
    console.log('Attempting to save image:', imageUrl);

    const hasPermission = await requestPhotoLibraryPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Photo library access is required to save images.',
      );
      return false;
    }

    try {
      await CameraRoll.save(imageUrl, {type: 'photo'});
      Alert.alert('Success', 'Image saved to your photo library!');
      return true;
    } catch (directSaveError) {
      console.log(
        'Direct save failed, trying download method:',
        directSaveError,
      );

      const timestamp = Date.now();
      const fileName = `product_image_${timestamp}.jpg`;
      const downloadDest = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

      console.log('Downloading to:', downloadDest);

      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: downloadDest,
      }).promise;

      if (downloadResult.statusCode === 200) {
        console.log('Download successful, saving to camera roll');

        await CameraRoll.save(`file://${downloadDest}`, {type: 'photo'});

        try {
          await RNFS.unlink(downloadDest);
        } catch (unlinkError) {
          console.log('Failed to clean up temp file:', unlinkError);
        }

        Alert.alert('Success', 'Image saved to your photo library!');
        return true;
      } else {
        throw new Error(
          `Download failed with status: ${downloadResult.statusCode}`,
        );
      }
    }
  } catch (error) {
    console.error('Error saving image:', error);
    Alert.alert('Error', 'Failed to save image. Please try again.');
    return false;
  }
};

export const saveImageToDeviceAlternative = async (
  imageUrl: string,
): Promise<boolean> => {
  try {
    const hasPermission = await requestPhotoLibraryPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage access is required to save images.',
      );
      return false;
    }

    const timestamp = Date.now();
    const fileName = `product_image_${timestamp}.jpg`;

    const downloadDest =
      Platform.OS === 'android'
        ? `${RNFS.PicturesDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

    console.log('Saving to:', downloadDest);

    const downloadResult = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: downloadDest,
    }).promise;

    if (downloadResult.statusCode === 200) {
      Alert.alert(
        'Success',
        `Image saved to ${
          Platform.OS === 'android' ? 'Pictures folder' : 'Documents folder'
        }!`,
      );
      return true;
    } else {
      throw new Error(
        `Download failed with status: ${downloadResult.statusCode}`,
      );
    }
  } catch (error) {
    console.error('Error saving image (alternative method):', error);
    Alert.alert('Error', 'Failed to save image. Please try again.');
    return false;
  }
};
