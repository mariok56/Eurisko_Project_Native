export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: {
    url: string;
  };
  isEmailVerified: boolean;
  createdAt?: string;
}

export interface Post {
  createdAt?: string;
}
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ImageFile {
  uri: string;
  type?: string;
  name?: string;
  fileName?: string;
  fileSize?: number;
}
