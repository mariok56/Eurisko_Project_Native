import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import {refreshAccessToken} from '../services/authApi';

const BASE_URL = 'https://backend-practice.eurisko.me';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get tokens from secure storage
export const getTokens = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({service: 'auth'});
    if (credentials) {
      return JSON.parse(credentials.password);
    }
    return null;
  } catch (error) {
    console.error('Error getting tokens from keychain:', error);
    return null;
  }
};

// Function to store tokens in secure storage
export const storeTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  try {
    await Keychain.setGenericPassword(
      'auth_tokens',
      JSON.stringify({accessToken, refreshToken}),
      {service: 'auth'},
    );
    return true;
  } catch (error) {
    console.error('Error storing tokens in keychain:', error);
    return false;
  }
};

// Function to clear tokens from secure storage
export const clearTokens = async () => {
  try {
    await Keychain.resetGenericPassword({service: 'auth'});
    return true;
  } catch (error) {
    console.error('Error clearing tokens from keychain:', error);
    return false;
  }
};

// Set up request interceptor for authentication - FIXED
apiClient.interceptors.request.use(
  async config => {
    // Add authorization header to requests if access token exists
    const tokens = await getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    // Safely log request details without accessing undefined properties
    try {
      let dataLog = 'No data';
      if (config.data) {
        if (config.data instanceof FormData) {
          dataLog = 'FormData (not shown)';
        } else {
          try {
            dataLog = JSON.stringify(config.data).substring(0, 200);
          } catch (e) {
            dataLog = 'Data exists but cannot be stringified';
          }
        }
      }

      console.log(`Request to ${config.url || 'unknown'}:`, {
        method: config.method || 'unknown',
        headers: config.headers || 'No headers',
        data: dataLog,
      });
    } catch (logError) {
      console.log('Error logging request:', logError);
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Set up response interceptor for token refresh and detailed error logging - FIXED
apiClient.interceptors.response.use(
  response => {
    // Safely log successful responses
    try {
      let dataLog = 'No data';
      if (response.data) {
        try {
          dataLog = JSON.stringify(response.data).substring(0, 200);
        } catch (e) {
          dataLog = 'Data exists but cannot be stringified';
        }
      }

      console.log(`Response from ${response.config?.url || 'unknown'}:`, {
        status: response.status || 'unknown',
        data: dataLog,
      });
    } catch (logError) {
      console.log('Error logging response:', logError);
    }

    return response;
  },
  async error => {
    // Safely handle and log errors
    try {
      const originalRequest = error.config;
      const url = originalRequest?.url || 'unknown endpoint';

      if (error.response) {
        // Safely build error data
        let dataLog = 'No data';
        let messageLog = error.message || 'Unknown error';
        let headersLog = 'No headers';

        if (error.response.data) {
          try {
            dataLog = JSON.stringify(error.response.data);
          } catch (e) {
            dataLog = 'Data exists but cannot be stringified';
          }

          if (error.response.data.error?.message) {
            messageLog = error.response.data.error.message;
          }
        }

        if (originalRequest?.headers) {
          try {
            headersLog = JSON.stringify(originalRequest.headers);
          } catch (e) {
            headersLog = 'Headers exist but cannot be stringified';
          }
        }

        console.error(`Error from ${url}:`, {
          status: error.response.status || 'unknown',
          data: dataLog,
          message: messageLog,
          headers: headersLog,
        });
      } else {
        console.error('Network error:', error.message || 'Unknown error');
      }

      // If error is 401 Unauthorized and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest?._retry) {
        if (originalRequest) {
          originalRequest._retry = true;

          try {
            const tokens = await getTokens();

            if (tokens?.refreshToken) {
              // Try to refresh the token
              const newTokens = await refreshAccessToken(tokens.refreshToken);

              if (newTokens) {
                // Store new tokens
                await storeTokens(
                  newTokens.accessToken,
                  newTokens.refreshToken,
                );

                // Update the authorization header and retry the request
                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                return apiClient(originalRequest);
              }
            }

            // If refresh token is invalid or expired, clear tokens and force logout
            await clearTokens();
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            await clearTokens();
          }
        }
      }
    } catch (handlingError) {
      console.error('Error handling API error:', handlingError);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
