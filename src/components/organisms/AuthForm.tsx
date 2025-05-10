import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Control } from 'react-hook-form';
import Button from '../atoms/Button';
import FormField from '../molecules/FormField';
import { useTheme } from '../../contexts/ThemeContext';
import { getResponsiveValue } from '../../utils/responsive';
import fontVariants from '../../utils/fonts';

interface FormField {
  name: string;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

interface AuthFormProps {
  fields: FormField[];
  control: Control<any>;
  errors: Record<string, any>;
  onSubmit: () => void;
  submitButtonText: string;
  isLoading?: boolean;
  errorMessage?: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({
  fields,
  control,
  errors,
  onSubmit,
  submitButtonText,
  isLoading = false,
  errorMessage = null,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {errorMessage && (
        <Text 
          style={[
            styles.errorText, 
            { color: colors.error },
            fontVariants.bodyBold
          ]}
        >
          {errorMessage}
        </Text>
      )}

      {fields.map((field) => (
        <FormField
          key={field.name}
          name={field.name}
          control={control}
          label={field.label}
          placeholder={field.placeholder}
          secureTextEntry={field.secureTextEntry}
          keyboardType={field.keyboardType}
          autoCapitalize={field.autoCapitalize}
          error={errors[field.name]?.message}
        />
      ))}

      <Button
        title={submitButtonText}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorText: {
    fontSize: getResponsiveValue(14),
    marginBottom: getResponsiveValue(16),
    textAlign: 'center',
  },
});

export default AuthForm;