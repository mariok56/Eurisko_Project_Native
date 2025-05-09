import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getResponsiveValue } from '../../utils/responsive';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  showLabel = false,
}) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };
  
  return (
    <View style={styles.container}>
      {showLabel && (
        <Text 
          style={[
            styles.label, 
            { color: colors.text }
          ]}
        >
          {isDarkMode ? 'Dark' : 'Light'}
        </Text>
      )}
      <TouchableOpacity 
        style={[
          styles.button,
          { 
            backgroundColor: isDarkMode ? colors.card : colors.background, 
            borderColor: colors.border 
          },
          size === 'small' && styles.buttonSmall,
          size === 'large' && styles.buttonLarge,
        ]}
        onPress={toggleTheme}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={{ fontSize: getIconSize() }}>
          {isDarkMode ? '☀️' : '🌙'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginRight: getResponsiveValue(8),
    fontSize: getResponsiveValue(14),
  },
  button: {
    padding: getResponsiveValue(8),
    borderRadius: getResponsiveValue(20),
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  buttonSmall: {
    padding: getResponsiveValue(6),
    borderRadius: getResponsiveValue(16),
  },
  buttonLarge: {
    padding: getResponsiveValue(12),
    borderRadius: getResponsiveValue(24),
  },
});

export default ThemeToggle;