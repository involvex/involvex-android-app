/**
 * GitHub API Service
 * Business logic for GitHub API interactions
 * Ported from Flutter app: lib/data/services/github_service.dart
 */

import { githubClient, TimeframeType } from './githubClient';
import { GitHubRepository } from '../../models/GitHubRepository';

export interface SearchOptions {
  language?: string;
  minStars?: number;
  sort?: 'stars' | 'forks' | 'updated' | 'best-match';
  order?: 'asc' | 'desc';
  perPage?: number;
}

class GitHubService {
  /**
   * Get trending repositories for a specific timeframe
   */
  async getTrending(
    timeframe: TimeframeType = 'daily',
    options: SearchOptions = {},
  ): Promise<GitHubRepository[]> {
    try {
      const { minStars = 10, perPage = 50 } = options;

      // Calculate date for timeframe
      const since = githubClient.mapTimeframeToDate(timeframe);

      // Build search query
      const queries: string[] = [`created:>${since}`, `stars:>${minStars}`];

      if (options.language) {
        queries.push(`language:${options.language}`);
      }

      const q = queries.join(' ');

      // Make API request
      const response = await githubClient
        .getInstance()
        .get('/search/repositories', {
          params: {
            q,
            sort: options.sort || 'stars',
            order: options.order || 'desc',
            per_page: perPage,
          },
        });

      // Parse and return repositories
      const repos = response.data.items.map((item: any) => {
        const repo = GitHubRepository.fromJSON(item);
        repo.trendingPeriod = timeframe;
        return repo;
      });

      return repos;
    } catch (error) {
      console.error('Error fetching trending repositories:', error);
      throw new Error('Failed to fetch trending repositories');
    }
  }

  /**
   * Search repositories with filters
   */
  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<GitHubRepository[]> {
    try {
      const { perPage = 50 } = options;

      // Build search query
      const queries: string[] = [query];

      if (options.language) {
        queries.push(`language:${options.language}`);
      }

      if (options.minStars) {
        queries.push(`stars:>${options.minStars}`);
      }

      const q = queries.join(' ');

      // Make API request
      const response = await githubClient
        .getInstance()
        .get('/search/repositories', {
          params: {
            q,
            sort: options.sort || 'best-match',
            order: options.order || 'desc',
            per_page: perPage,
          },
        });

      // Parse and return repositories
      return response.data.items.map((item: any) =>
        GitHubRepository.fromJSON(item),
      );
    } catch (error) {
      console.error('Error searching repositories:', error);
      throw new Error('Failed to search repositories');
    }
  }

  /**
   * Get repository details by owner and name
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await githubClient
        .getInstance()
        .get(`/repos/${owner}/${repo}`);
      return GitHubRepository.fromJSON(response.data);
    } catch (error) {
      console.error('Error fetching repository details:', error);
      throw new Error('Failed to fetch repository details');
    }
  }

  /**
   * Get latest releases for a repository
   */
  async getReleases(owner: string, repo: string, perPage: number = 10) {
    try {
      const response = await githubClient
        .getInstance()
        .get(`/repos/${owner}/${repo}/releases`, {
          params: { per_page: perPage },
        });
      return response.data;
    } catch (error) {
      console.error('Error fetching releases:', error);
      return [];
    }
  }

  /**
   * Get repository README
   */
  async getReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const response = await githubClient
        .getInstance()
        .get(`/repos/${owner}/${repo}/readme`, {
          headers: {
            Accept: 'application/vnd.github.v3.raw',
          },
        });
      return response.data;
    } catch (error) {
      console.error('Error fetching README:', error);
      return null;
    }
  }

  /**
   * Get trending developers (optional feature)
   */
  async getTrendingDevelopers(timeframe: TimeframeType = 'daily') {
    try {
      const since = githubClient.mapTimeframeToDate(timeframe);

      const response = await githubClient.getInstance().get('/search/users', {
        params: {
          q: `created:>${since}`,
          sort: 'followers',
          order: 'desc',
          per_page: 30,
        },
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching trending developers:', error);
      return [];
    }
  }
}

// Export singleton instance
export const githubService = new GitHubService();
export default githubService;
