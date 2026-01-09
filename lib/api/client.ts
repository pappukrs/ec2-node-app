import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config';
import { AuthUtils } from '../auth/utils';

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = AuthUtils.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, add to queue
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            }).catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Try to refresh token using httpOnly cookies
            const response = await axios.post(`${config.api.baseUrl}/auth/refresh`, {}, {
              withCredentials: true, // Send cookies
            });

            const { accessToken } = response.data;

            // Update localStorage with new access token
            localStorage.setItem('accessToken', accessToken);

            // Update authorization header for original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Process queued requests
            this.processQueue(null, accessToken);

            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            this.processQueue(refreshError, null);
            localStorage.removeItem('accessToken');
            AuthUtils.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: unknown, token: string | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token!);
      }
    });

    this.failedQueue = [];
  }

  // Public methods
  public async get<T = unknown>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  public async post<T = unknown>(url: string, data?: unknown, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  public async put<T = unknown>(url: string, data?: unknown, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  public async patch<T = unknown>(url: string, data?: unknown, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  public async delete<T = unknown>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }

  // Get the axios instance (for advanced usage)
  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export types
export type { AxiosResponse, AxiosError };
