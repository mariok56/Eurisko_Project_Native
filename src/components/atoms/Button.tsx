import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps 
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getResponsiveValue } from '../../utils/responsive';
import fontVariants from '../../utils/fonts';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  loading = false, 
  variant = 'primary',
  ...rest 
}) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && { backgroundColor: colors.primary },
        variant === 'secondary' && { backgroundColor: colors.secondary },
        variant === 'outline' && { 
          backgroundColor: 'transparent', 
          borderWidth: 1, 
          borderColor: colors.primary 
        },
        rest.disabled && styles.disabledButton
      ]}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#fff'} />
      ) : (
        <Text 
          style={[
            styles.buttonText,
            fontVariants.button,
            { color: variant === 'outline' ? colors.primary : '#fff' }
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: getResponsiveValue(8),
    padding: getResponsiveValue(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: getResponsiveValue(10),
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    textAlign: 'center',
  },
});

export default Button;