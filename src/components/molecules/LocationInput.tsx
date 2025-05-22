import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';

interface LocationInputModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (locationName: string) => void;
  initialValue?: string;
  title?: string;
}

const LocationInputModal: React.FC<LocationInputModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialValue = '',
  title = 'Enter Location',
}) => {
  const {colors} = useTheme();
  const [locationName, setLocationName] = useState(initialValue);

  const handleConfirm = () => {
    if (locationName.trim()) {
      onConfirm(locationName.trim());
      onClose();
    }
  };

  const handleClose = () => {
    setLocationName(initialValue);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, {backgroundColor: colors.card}]}>
          <Text
            style={[styles.title, {color: colors.text}, fontVariants.heading3]}>
            {title}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
              fontVariants.body,
            ]}
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Enter location name"
            placeholderTextColor={colors.border}
            autoFocus={true}
            onSubmitEditing={handleConfirm}
            returnKeyType="done"
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                {borderColor: colors.border},
              ]}
              onPress={handleClose}>
              <Text
                style={[
                  styles.buttonText,
                  {color: colors.text},
                  fontVariants.button,
                ]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                {backgroundColor: colors.primary},
              ]}
              onPress={handleConfirm}>
              <Text
                style={[
                  styles.buttonText,
                  {color: colors.card},
                  fontVariants.button,
                ]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(20),
  },
  container: {
    width: '100%',
    maxWidth: getResponsiveValue(300),
    borderRadius: getResponsiveValue(12),
    padding: getResponsiveValue(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    textAlign: 'center',
    marginBottom: getResponsiveValue(20),
  },
  input: {
    borderWidth: 1,
    borderRadius: getResponsiveValue(8),
    padding: getResponsiveValue(12),
    marginBottom: getResponsiveValue(20),
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: getResponsiveValue(12),
    borderRadius: getResponsiveValue(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    marginRight: getResponsiveValue(8),
  },
  confirmButton: {
    marginLeft: getResponsiveValue(8),
  },
  buttonText: {
    textAlign: 'center',
  },
});

export default LocationInputModal;
