import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { auth, refreshToken } from './firebase';

const attachAccessToken = async (config: InternalAxiosRequestConfig) => {
  if (config.baseURL === '') {
    return config;
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    return config;
  }

  const accessToken = await currentUser.getIdToken();
  config.headers.set('Authorization', `Bearer ${accessToken}`);

  return config;
};

/**
 * Adds interceptors that attach Firebase bearer tokens to requests and retry once after refresh.
 *
 * @see verifyToken {@link server/src/middleware.ts}
 */
export const authInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(attachAccessToken);

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!error.response || !error.config) {
        return Promise.reject(error);
      }

      const { status } = error.response;
      const originalConfig = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (status === 401 && !originalConfig._retry) {
        try {
          originalConfig._retry = true;

          const refreshedToken = await refreshToken();
          if (!refreshedToken) {
            return Promise.reject(error);
          }

          originalConfig.headers.set(
            'Authorization',
            `Bearer ${refreshedToken.accessToken}`
          );

          return axiosInstance(originalConfig);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};
