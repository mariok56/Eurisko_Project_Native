import {create} from 'zustand';
import {clearTokens} from '../lib/axioInstance';
import {User} from '../types/auth';

// State interface for our auth store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (status: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,

  // Set user data
  setUser: user => set({user}),

  // Set authentication status
  setAuthenticated: status => set({isAuthenticated: status}),

  // Logout - clears tokens and resets state
  logout: async () => {
    // Clear tokens from secure storage
    await clearTokens();

    // Reset auth state
    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));
