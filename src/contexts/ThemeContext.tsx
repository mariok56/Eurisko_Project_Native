import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContextType, ThemeColors } from '../types/theme';

const lightColors: ThemeColors = {
  primary: '#6200ee',
  secondary: '#03dac6',
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#000000',
  border: '#e0e0e0',
  notification: '#f50057',
  error: '#B00020',
  success: '#4CAF50',
};

const darkColors: ThemeColors = {
  primary: '#BB86FC',
  secondary: '#03DAC6',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  border: '#2C2C2C',
  notification: '#CF6679',
  error: '#CF6679',
  success: '#4CAF50',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {

  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  
  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const colors = isDarkMode ? darkColors : lightColors;
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};