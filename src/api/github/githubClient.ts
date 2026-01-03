/**
 * GitHub API Client
 * Handles all API communication with GitHub
 */

import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

export type TimeframeType = 'daily' | 'weekly' | 'monthly';

class GitHubClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      timeout: 30000,
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    // Add retry logic with exponential backoff
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: error => {
        // Retry on network errors or 5xx responses
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ?? 0) >= 500
        );
      },
    });

    // Add request interceptor for GitHub PAT (if available)
    this.client.interceptors.request.use(config => {
      // TODO: Add GitHub Personal Access Token from settings if available
      // This increases rate limit from 60 to 5000 requests/hour
      // const token = getUserGitHubToken();
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    });

    // Add response interceptor for rate limit handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 403) {
          const rateLimitRemaining =
            error.response.headers['x-ratelimit-remaining'];
          const rateLimitReset = error.response.headers['x-ratelimit-reset'];

          if (rateLimitRemaining === '0') {
            const resetDate = new Date(parseInt(rateLimitReset, 10) * 1000);
            const message = `GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`;
            console.warn(message);
            throw new Error(message);
          }
        }
        throw error;
      },
    );
  }

  /**
   * Get axios instance for making requests
   */
  getInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Map timeframe to date string for GitHub search
   */
  mapTimeframeToDate(timeframe: TimeframeType): string {
    const now = new Date();
    let daysAgo = 1;

    switch (timeframe) {
      case 'weekly':
        daysAgo = 7;
        break;
      case 'monthly':
        daysAgo = 30;
        break;
      case 'daily':
      default:
        daysAgo = 1;
        break;
    }

    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

// Export singleton instance
export const githubClient = new GitHubClient();
export default githubClient;
