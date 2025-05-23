import {create} from 'zustand';
import {clearTokens} from '../lib/axioInstance';
import {User} from '../types/auth';

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

  setUser: user => set({user}),

  setAuthenticated: status => set({isAuthenticated: status}),

  logout: async () => {
    await clearTokens();

    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));
