import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from '../atoms/icons';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';

interface ProductsHeaderRightProps {
  onAddProduct: () => void;
}

interface LoadingMoreProps {
  visible: boolean;
}

export const ProductsHeaderRight: React.FC<ProductsHeaderRightProps> = ({
  onAddProduct,
}) => {
  const {colors} = useTheme();

  return (
    <TouchableOpacity onPress={onAddProduct} style={styles.headerButton}>
      <Icon name="add" size={24} color={colors.primary} />
    </TouchableOpacity>
  );
};

export const LoadingMoreComponent: React.FC<LoadingMoreProps> = ({visible}) => {
  const {colors} = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.loadingMore}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={[styles.loadingMoreText, {color: colors.text}]}>
        Loading more...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    padding: getResponsiveValue(8),
    borderRadius: getResponsiveValue(20),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: getResponsiveValue(40),
    minHeight: getResponsiveValue(40),
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: getResponsiveValue(16),
  },
  loadingMoreText: {
    marginLeft: getResponsiveValue(8),
  },
});
