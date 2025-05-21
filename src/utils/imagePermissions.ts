// src/utils/permissions.ts (or /utils/imagePermissions.ts)
import {PermissionsAndroid, Platform, Alert} from 'react-native';

export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'We need access to your camera to take photos.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission error:', err);
      Alert.alert('Permission Error', 'Unable to request camera permission.');
      return false;
    }
  }
  return true;
};
