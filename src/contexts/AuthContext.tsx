import React, {createContext, useContext, useState, ReactNode} from 'react';
import {AuthState, User} from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
  ) => Promise<boolean>;
  verify: (code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    setState({...state, isLoading: true});

    // Simple mock login
    // In a real app, this would be an API call
    try {
      // Check for the hardcoded credentials (email and password)
      if (email === 'eurisko@gmail.com' && password === 'academy2025') {
        const user: User = {
          name: 'Eurisko User',
          email,
          phoneNumber: '1234567890',
        };

        setState({
          user,
          isAuthenticated: false, // Don't set to true yet, wait for verification
          isLoading: false,
        });
        return true;
      }
      setState({...state, isLoading: false});
      return false;
    } catch (error) {
      setState({...state, isLoading: false});
      return false;
    }
  };

  const register = async (
    _name: string,
    _email: string,
    _password: string,
    _phoneNumber: string,
  ): Promise<boolean> => {
    setState({...state, isLoading: true});

    // Mock registration
    // In a real app, this would be an API call
    try {
      // Simulate delay
      setTimeout(() => {
        setState({...state, isLoading: false});
      }, 1000);
      return true;
    } catch (error) {
      setState({...state, isLoading: false});
      return false;
    }
  };

  const verify = async (code: string): Promise<boolean> => {
    setState({...state, isLoading: true});

    // Mock verification
    // In a real app, this would verify the OTP with an API
    try {
      if (code === '1234') {
        setState({
          ...state,
          isAuthenticated: true, // Set to true after successful verification
          isLoading: false,
        });
        return true;
      }
      setState({...state, isLoading: false});
      return false;
    } catch (error) {
      setState({...state, isLoading: false});
      return false;
    }
  };

  const logout = () => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        verify,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
