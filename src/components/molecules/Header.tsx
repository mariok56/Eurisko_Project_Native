import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { getResponsiveValue } from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import ThemeToggle from '../atoms/ThemeToggle';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showThemeToggle?: boolean;
  rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showThemeToggle = true,
  rightComponent,
}) => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border 
        }
      ]}
    >
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text style={[styles.backText, { color: colors.primary }]}>←</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.titleContainer}>
        <Text 
          style={[
            styles.title, 
            { color: colors.text },
            fontVariants.heading3
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      
      <View style={styles.rightContainer}>
        {rightComponent ? (
          rightComponent
        ) : (
          showThemeToggle && <ThemeToggle size="small" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: getResponsiveValue(56),
    paddingHorizontal: getResponsiveValue(16),
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 100,
  },
  leftContainer: {
    width: getResponsiveValue(40),
    height: '100%',
    justifyContent: 'center',
    zIndex: 1,
  },
  rightContainer: {
    width: getResponsiveValue(40),
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  backButton: {
    padding: getResponsiveValue(4),
  },
  backText: {
    fontSize: getResponsiveValue(28),
    fontWeight: 'bold',
  },
});

export default Header;