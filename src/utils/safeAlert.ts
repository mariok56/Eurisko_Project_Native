// src/utils/safeAlert.ts
import {Alert, Platform} from 'react-native';

interface SafeAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export const safeAlert = (
  title: string,
  message?: string,
  buttons?: SafeAlertButton[],
  options?: {
    cancelable?: boolean;
    onDismiss?: () => void;
  },
) => {
  // Add a small delay to ensure the Activity is ready
  const showAlert = () => {
    try {
      Alert.alert(title, message, buttons, options);
    } catch (error) {
      console.error('Error showing alert:', error);
      // Fallback - try again after a longer delay
      setTimeout(() => {
        try {
          Alert.alert(title, message, buttons, options);
        } catch (secondError) {
          console.error('Second attempt to show alert failed:', secondError);
        }
      }, 500);
    }
  };

  if (Platform.OS === 'android') {
    // For Android, add a small delay to ensure Activity is ready
    setTimeout(showAlert, 100);
  } else {
    // iOS doesn't have this issue, show immediately
    showAlert();
  }
};

export const safePrompt = (
  title: string,
  message?: string,
  callbackOrButtons?: ((text: string) => void) | SafeAlertButton[],
  type?: 'default' | 'plain-text' | 'secure-text' | 'login-password',
  defaultValue?: string,
  keyboardType?: string,
) => {
  const showPrompt = () => {
    try {
      Alert.prompt(
        title,
        message,
        callbackOrButtons,
        type,
        defaultValue,
        keyboardType,
      );
    } catch (error) {
      console.error('Error showing prompt:', error);
      // Fallback for prompt
      setTimeout(() => {
        try {
          Alert.prompt(
            title,
            message,
            callbackOrButtons,
            type,
            defaultValue,
            keyboardType,
          );
        } catch (secondError) {
          console.error('Second attempt to show prompt failed:', secondError);
        }
      }, 500);
    }
  };

  if (Platform.OS === 'android') {
    setTimeout(showPrompt, 100);
  } else {
    showPrompt();
  }
};
