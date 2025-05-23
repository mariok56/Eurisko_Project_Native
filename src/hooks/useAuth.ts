import {useMutation, useQuery} from '@tanstack/react-query';
import * as authApi from '../services/authApi';
import {storeTokens, getTokens} from '../lib/axioInstance';
import {ImageFile} from '../types/auth';
import {getUserFriendlyErrorMessage} from '../utils/errorHandling';

interface LoginData {
  email: string;
  password: string;
  token_expires_in?: string;
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

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
      token_expires_in = '1y',
    }: LoginData) => {
      try {
        const response = await authApi.login({
          email,
          password,
          token_expires_in,
        });

        if (
          response.success &&
          response.data.accessToken &&
          response.data.refreshToken
        ) {
          // Store tokens securely
          await storeTokens(
            response.data.accessToken,
            response.data.refreshToken,
          );
          return response.data;
        }

        throw new Error(response.data.message || 'Login failed');
      } catch (error) {
        // Convert technical error to user-friendly message
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        throw new Error(userFriendlyMessage);
      }
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      password,
      profileImage,
    }: SignupData) => {
      try {
        const response = await authApi.signup({
          firstName,
          lastName,
          email,
          password,
          profileImage,
        });

        if (!response.success) {
          throw new Error(response.data.message || 'Signup failed');
        }

        return response.data;
      } catch (error) {
        // Convert technical error to user-friendly message
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        throw new Error(userFriendlyMessage);
      }
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async ({email, otp}: VerifyOtpData) => {
      try {
        const response = await authApi.verifyOtp({email, otp});

        if (!response.success) {
          throw new Error(response.data.message || 'OTP verification failed');
        }

        return response.data;
      } catch (error) {
        // Convert technical error to user-friendly message
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        throw new Error(userFriendlyMessage);
      }
    },
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      try {
        const response = await authApi.resendVerificationOtp(email);

        if (!response.success) {
          throw new Error(response.data.message || 'Failed to resend OTP');
        }

        return response.data;
      } catch (error) {
        // Convert technical error to user-friendly message
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        throw new Error(userFriendlyMessage);
      }
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      try {
        const response = await authApi.forgotPassword(email);

        if (!response.success) {
          throw new Error(
            response.data.message || 'Failed to send reset email',
          );
        }

        return response.data;
      } catch (error) {
        // Convert technical error to user-friendly message
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        throw new Error(userFriendlyMessage);
      }
    },
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      try {
        const tokens = await getTokens();

        // Only fetch profile if we have tokens
        if (!tokens?.accessToken) {
          throw new Error('Not authenticated');
        }

        const response = await authApi.getUserProfile();

        if (!response.success || !response.data.user) {
          throw new Error(
            response.data.message || 'Failed to get user profile',
          );
        }

        // Map the API response to our User type
        const user = response.data.user;
        if (!user) {
          throw new Error('User data not found in response');
        }

        return {
          id: user.id, // API returns 'id' field according to the API docs
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified,
        };
      } catch (error) {
        // Convert technical error to user-friendly message
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        throw new Error(userFriendlyMessage);
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (data: {
      firstName?: string;
      lastName?: string;
      profileImage?: ImageFile;
    }) => {
      try {
        const response = await authApi.updateUserProfile(data);

        if (!response.success) {
          throw new Error(response.data.message || 'Failed to update profile');
        }

        const user = response.data.user;
        if (!user) {
          throw new Error('User data not found in response');
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified,
        };
      } catch (error) {
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        throw new Error(userFriendlyMessage);
      }
    },
  });
};
export const useUserProfileById = (userId: string) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      try {
        const response = await authApi.getUserProfileById(userId);

        if (!response.success || !response.data.user) {
          throw new Error(
            response.data.message || 'Failed to get user profile',
          );
        }

        const user = response.data.user;
        if (!user) {
          throw new Error('User data not found in response');
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        };
      } catch (error) {
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        throw new Error(userFriendlyMessage);
      }
    },
    enabled: !!userId,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
