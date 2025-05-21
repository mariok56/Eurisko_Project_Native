import apiClient from '../lib/axioInstance';
import {endpoints} from '../constant/endpoint';
import {ImageFile} from '../types/auth';

// Types for API responses and requests
interface AuthResponse {
  success: boolean;
  data: {
    accessToken?: string;
    refreshToken?: string;
    message?: string;
    isEmailVerified?: boolean;
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      profileImage?: {
        url: string;
      };
      isEmailVerified: boolean;
    };
  };
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImage?: ImageFile;
}

interface VerifyOtpData {
  email: string;
  otp: string;
}

interface LoginData {
  email: string;
  password: string;
  token_expires_in?: string;
}

interface RefreshTokenData {
  refreshToken: string;
  token_expires_in?: string;
}

// Authentication API functions
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const formData = new FormData();

  formData.append('firstName', data.firstName);
  formData.append('lastName', data.lastName);
  formData.append('email', data.email);
  formData.append('password', data.password);

  if (data.profileImage && data.profileImage.uri) {
    // Format to match exactly what Postman would send
    formData.append('profileImage', {
      uri: data.profileImage.uri,
      type: data.profileImage.type || 'image/jpeg',
      name: data.profileImage.fileName || 'profile.jpg',
    } as any);
  }

  console.log('Signup request to:', endpoints.auth.register);
  console.log('Form data fields:', {
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    hasImage: !!data.profileImage,
  });

  try {
    const response = await apiClient.post<AuthResponse>(
      endpoints.auth.register,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// In src/services/authApi.ts
export const verifyOtp = async (data: VerifyOtpData): Promise<AuthResponse> => {
  try {
    // Build the exact payload that works in Postman
    const payload = {
      email: data.email,
      otp: data.otp,
    };

    // Log the exact payload for debugging
    console.log('Verify OTP payload:', payload);

    const response = await apiClient.post<AuthResponse>(
      endpoints.auth.verify,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

export const resendVerificationOtp = async (
  email: string,
): Promise<AuthResponse> => {
  try {
    console.log(`Sending OTP resend request for email: ${email}`);

    const response = await apiClient.post<AuthResponse>(
      endpoints.auth.resendOtp,
      {
        email: email,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('OTP resend response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw error;
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    // Include token_expires_in to match Postman
    const payload = {
      email: data.email,
      password: data.password,
      token_expires_in: data.token_expires_in || '5m',
    };

    const response = await apiClient.post<AuthResponse>(
      endpoints.auth.login,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{accessToken: string; refreshToken: string} | null> => {
  try {
    const data: RefreshTokenData = {
      refreshToken,
      token_expires_in: '1y',
    };

    const response = await apiClient.post<AuthResponse>(
      endpoints.auth.refreshToken,
      data,
    );

    if (
      response.data.success &&
      response.data.data.accessToken &&
      response.data.data.refreshToken
    ) {
      return {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
    }

    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

export const forgotPassword = async (email: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    endpoints.auth.forgotPassword,
    {
      email,
    },
  );
  return response.data;
};

export const getUserProfile = async (): Promise<AuthResponse> => {
  const response = await apiClient.get<AuthResponse>(endpoints.user.getUser);
  return response.data;
};

export const updateUserProfile = async (data: {
  firstName?: string;
  lastName?: string;
  profileImage?: ImageFile;
}): Promise<AuthResponse> => {
  const formData = new FormData();

  if (data.firstName) {
    formData.append('firstName', data.firstName);
  }

  if (data.lastName) {
    formData.append('lastName', data.lastName);
  }

  if (data.profileImage && data.profileImage.uri) {
    formData.append('profileImage', {
      uri: data.profileImage.uri,
      type: data.profileImage.type || 'image/jpeg',
      name: data.profileImage.fileName || 'profile.jpg',
    } as any);
  }

  const response = await apiClient.put<AuthResponse>(
    endpoints.user.updateUser,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
};
