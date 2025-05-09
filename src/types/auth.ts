export interface User {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}