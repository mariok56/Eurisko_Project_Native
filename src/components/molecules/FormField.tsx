import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Control } from 'react-hook-form';
import Input from '../atoms/Input';
import { useTheme } from '../../contexts/ThemeContext';
import { getResponsiveValue } from '../../utils/responsive';
import fontVariants from '../../utils/fonts';

interface FormFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  control,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  placeholder,
  autoCapitalize = 'sentences',
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text 
        style={[
          styles.label, 
          { color: colors.text },
          fontVariants.bodyBold
        ]}
      >
        {label}
      </Text>
      <Input
        name={name}
        control={control}
        label=""
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        error={error}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: getResponsiveValue(20),
    width: '100%',
  },
  label: {
    marginBottom: getResponsiveValue(8),
  },
});

export default FormField;