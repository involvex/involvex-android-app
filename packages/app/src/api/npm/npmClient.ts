/**
 * npm Registry API Client
 * Handles all API communication with npm registry
 */

import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import useSettingsStore from '../../store/settingsStore';

class NpmClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://registry.npmjs.org',
      timeout: 30000,
      headers: {
        Accept: 'application/json',
      },
    });

    // Add retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: error => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ?? 0) >= 500
        );
      },
    });

    // Add request interceptor for NPM Token (if available)
    this.client.interceptors.request.use(config => {
      const token = useSettingsStore.getState().settings.npmToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Get axios instance
   */
  getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const npmClient = new NpmClient();
export default npmClient;
