import React from 'react';
import {Text, StyleSheet} from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

const iconMap: Record<string, string> = {
  // Navigation icons
  add: '+',
  search: '🔍',
  clear: '✕',
  'attach-money': '$',
  schedule: '🕒',
  'keyboard-arrow-up': '↑',
  'keyboard-arrow-down': '↓',

  // Content icons
  image: '🖼️',
  'location-on': '📍',
  email: '✉️',
  edit: '✏️',
  delete: '🗑️',
  share: '📤',
  'error-outline': '⚠️',

  // Tab icons
  person: '👤',
  'shopping-bag': '🛍️',
  posts: '📰', // Add this
  news: '📰', // Add this
  article: '📄', // Add this

  // Default fallback
  default: '•',
};

const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000',
  style,
}) => {
  const iconChar = iconMap[name] || iconMap.default;

  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: size,
          color: color,
        },
        style,
      ]}>
      {iconChar}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    lineHeight: undefined,
  },
});

export default Icon;
