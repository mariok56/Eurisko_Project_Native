import React, { useRef, useState, createRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Keyboard,
} from 'react-native';
import { Control, Controller } from 'react-hook-form';

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
                  style={[styles.input, error && styles.errorInput]}
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
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  input: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  errorInput: {
    borderColor: '#ff4d4f',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default OtpInput;
