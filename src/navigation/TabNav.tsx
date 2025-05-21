import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import {useTheme} from '../contexts/ThemeContext';
import {getResponsiveValue} from '../utils/responsive';
import {TabParamList} from '../types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const {colors} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.border,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tab.Screen
        name="ProductsTab"
        component={ProductListScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({color, size}) => (
            <Icon name="shopping-bag" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <Icon name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: getResponsiveValue(60),
    paddingBottom: getResponsiveValue(6),
  },
  tabBarLabel: {
    fontSize: getResponsiveValue(12),
    marginBottom: getResponsiveValue(2),
  },
});

export default TabNavigator;
