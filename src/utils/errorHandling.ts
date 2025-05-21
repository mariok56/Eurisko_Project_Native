import axios from 'axios';

export const getUserFriendlyErrorMessage = (error: any): string => {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.error?.message;

    // Authentication errors
    if (status === 401) {
      return 'Invalid email or password. Please try again.';
    }

    if (status === 403) {
      if (serverMessage?.includes('verify your email')) {
        return 'Please verify your email before logging in.';
      }
      return "Access denied. You don't have permission to perform this action.";
    }

    // Validation errors
    if (status === 400) {
      if (serverMessage?.includes('OTP')) {
        return 'The verification code is incorrect or has expired. Please try again.';
      }
      if (serverMessage?.includes('email already exists')) {
        return 'This email is already registered. Please use a different email or try to log in.';
      }
      return serverMessage || 'Please check your information and try again.';
    }

    // Rate limiting
    if (status === 429) {
      if (serverMessage?.includes('OTP still valid')) {
        return 'A verification code was recently sent. Please check your email.';
      }
      return 'Too many attempts. Please wait a moment before trying again.';
    }

    // Server errors
    if (status && status >= 500) {
      return "We're experiencing technical difficulties. Please try again later.";
    }

    // Use server message if available, fallback to generic message
    return serverMessage || 'An error occurred. Please try again.';
  }

  // Handle network errors
  if (error.message?.includes('Network Error')) {
    return 'Unable to connect. Please check your internet connection.';
  }

  // Handle other errors
  return error.message || 'Something went wrong. Please try again.';
};
