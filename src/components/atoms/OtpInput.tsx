import React, { useRef, useState, createRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Keyboard,
} from 'react-native';
import { Control, Controller } from 'react-hook-form';
import { useTheme } from '../../contexts/ThemeContext';
import { getResponsiveValue } from '../../utils/responsive';
import fontVariants from '../../utils/fonts';

interface OtpInputProps {
  name: string;
  control: Control<any>;
  error?: string;
  onComplete?: (code: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({
  name,
  control,
  error,
  onComplete,
}) => {
  const { colors } = useTheme();
  const inputRefs = useRef<Array<React.RefObject<TextInput | null>>>(
    Array(4).fill(null).map(() => createRef<TextInput>())
  );

  const [otp, setOtp] = useState<string[]>(['', '', '', '']);

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.current?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange } }) => (
          <View>
            <View style={styles.inputContainer}>
              {[0, 1, 2, 3].map((index) => (
                <TextInput
                  key={index}
                  ref={inputRefs.current[index]}
                  style={[
                    styles.input, 
                    { 
                      borderColor: error ? colors.error : colors.border,
                      backgroundColor: colors.card,
                      color: colors.text
                    }
                  ]}
                  maxLength={1}
                  keyboardType="number-pad"
                  onChangeText={(text) => {
                    const newOtp = [...otp];
                    newOtp[index] = text;
                    setOtp(newOtp);
                    onChange(newOtp.join(''));

                    if (text && index < 3) {
                      inputRefs.current[index + 1]?.current?.focus();
                    }

                    if (index === 3 && text) {
                      const completeOtp = newOtp.join('');
                      if (completeOtp.length === 4) {
                        Keyboard.dismiss();
                        onComplete?.(completeOtp);
                      }
                    }
                  }}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  value={otp[index]}
                />
              ))}
            </View>
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
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: getResponsiveValue(16),
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  input: {
    width: getResponsiveValue(60),
    height: getResponsiveValue(60),
    borderWidth: 1,
    borderRadius: getResponsiveValue(8),
    textAlign: 'center',
    fontSize: getResponsiveValue(24),
    fontWeight: '600',
  },
  errorText: {
    marginTop: getResponsiveValue(4),
    textAlign: 'center',
  },
});

export default OtpInput;