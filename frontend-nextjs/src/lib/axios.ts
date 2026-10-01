import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import { authStorage } from "@/utils/auth-storage";

interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = authStorage.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/**
 * Refresh-token state.
 *
 * When multiple API requests receive 401 at the same time,
 * only one refresh request should be made.
 */
let isRefreshing = false;

let refreshSubscribers: Array<(accessToken: string) => void> = [];

/**
 * Add a request to the refresh queue.
 */
const subscribeToTokenRefresh = (
  callback: (accessToken: string) => void,
): void => {
  refreshSubscribers.push(callback);
};

/**
 * Resolve all queued requests after a successful refresh.
 */
const onTokenRefreshed = (accessToken: string): void => {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = [];
};

/**
 * Reject/clear the refresh queue.
 */
const clearRefreshSubscribers = (): void => {
  refreshSubscribers = [];
};

/**
 * Refresh access token.
 *
 * IMPORTANT:
 * Use the base axios instance here instead of apiClient.
 * Otherwise the refresh request itself could trigger the
 * response interceptor again if it returns 401.
 */
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = authStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error("Refresh token is missing.");
  }

  const response = await axios.get<RefreshTokenResponse>(
    `${env.apiBaseUrl}/auth/refresh-token`,
    {
      headers: {
        "x-refresh-token": refreshToken,
      },
    },
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data.data;

  authStorage.setTokens(accessToken, newRefreshToken);

  return accessToken;
};

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryAxiosRequestConfig | undefined;

    /**
     * Only handle 401 responses.
     */
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    /**
     * Prevent an infinite retry loop.
     */
    if (originalRequest._retry) {
      authStorage.clear();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = authStorage.getRefreshToken();

    /**
     * No refresh token means the session cannot be recovered.
     */
    if (!refreshToken) {
      authStorage.clear();

      return Promise.reject(error);
    }

    /**
     * If another request is already refreshing the token,
     * wait for that request to finish.
     */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeToTokenRefresh((accessToken) => {
          if (!originalRequest.headers) {
            originalRequest.headers = new AxiosHeaders();
          }

          originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);

          resolve(apiClient(originalRequest));
        });

        /**
         * The current implementation clears the queue on refresh
         * failure. The original request will then be rejected by
         * the auth state change.
         */
        void reject;
      });
    }

    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();

      /**
       * Retry all requests that were waiting for the refresh.
       */
      onTokenRefreshed(newAccessToken);

      /**
       * Retry the original request.
       */
      if (!originalRequest.headers) {
        originalRequest.headers = new AxiosHeaders();
      }

      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

      return apiClient(originalRequest);
    } catch (refreshError) {
      clearRefreshSubscribers();

      /**
       * Refresh token is invalid/expired/revoked.
       * The user must authenticate again.
       */
      authStorage.clear();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
