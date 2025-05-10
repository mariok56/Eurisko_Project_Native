import React from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps,
  KeyboardTypeOptions 
} from 'react-native';
import { Controller, Control } from 'react-hook-form';
import { useTheme } from '../../contexts/ThemeContext';
import { getResponsiveValue } from '../../utils/responsive';
import fontVariants from '../../utils/fonts';

interface InputProps extends TextInputProps {
  name: string;
  control: Control<any>;
  label: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

const Input: React.FC<InputProps> = ({
  name,
  control,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  ...rest
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      {label && (
        <Text 
          style={[
            styles.label, 
            { color: colors.text },
            fontVariants.bodyBold
          ]}
        >
          {label}
        </Text>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input, 
              { 
                borderColor: error ? colors.error : colors.border,
                backgroundColor: colors.card,
                color: colors.text
              },
              fontVariants.body
            ]}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            placeholderTextColor={colors.border}
            {...rest}
          />
        )}
      />
      {error && (
        <Text 
          style={[
            styles.errorText, 
            { color: colors.error },
            fontVariants.caption
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: getResponsiveValue(16),
    width: '100%',
  },
  label: {
    marginBottom: getResponsiveValue(6),
  },
  input: {
    borderWidth: 1,
    borderRadius: getResponsiveValue(8),
    padding: getResponsiveValue(12),
  },
  errorText: {
    marginTop: getResponsiveValue(4),
  },
});

export default Input;