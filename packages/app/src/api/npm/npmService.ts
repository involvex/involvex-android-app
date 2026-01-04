/**
 * npm API Service
 * Business logic for npm Registry API interactions
 * Ported from Flutter app: lib/data/services/npm_service.dart
 */

import { npmClient } from './npmClient';
import { NpmPackage } from '../../models/NpmPackage';
import { TimeframeType } from '../github/githubClient';

export interface NpmSearchOptions {
  quality?: number; // 0-1
  popularity?: number; // 0-1
  maintenance?: number; // 0-1
  perPage?: number;
}

class NpmService {
  /**
   * Get trending npm packages
   * Note: npm doesn't have a direct "trending" endpoint, so we use search
   * with quality/popularity weights to simulate trending
   */
  async getTrending(
    timeframe: TimeframeType = 'daily',
    options: NpmSearchOptions = {},
  ): Promise<NpmPackage[]> {
    try {
      const {
        quality = 0.8,
        popularity = 0.9,
        maintenance = 0.5,
        perPage = 50,
      } = options;

      // Use npm search API with popularity/quality weights
      const response = await npmClient.getInstance().get('/-/v1/search', {
        params: {
          text: 'boost-exact:false', // Get broader results
          size: perPage,
          quality,
          popularity,
          maintenance,
        },
      });

      // Parse and return packages
      const packages = response.data.objects.map((obj: any) => {
        const pkg = NpmPackage.fromJSON(obj.package);
        pkg.trendingPeriod = timeframe;
        return pkg;
      });

      return packages;
    } catch (error) {
      console.error('Error fetching trending packages:', error);
      throw new Error('Failed to fetch trending packages');
    }
  }

  /**
   * Search npm packages
   */
  async search(
    query: string,
    options: NpmSearchOptions = {},
  ): Promise<NpmPackage[]> {
    try {
      const {
        quality = 0.5,
        popularity = 0.5,
        maintenance = 0.5,
        perPage = 50,
      } = options;

      const response = await npmClient.getInstance().get('/-/v1/search', {
        params: {
          text: query,
          size: perPage,
          quality,
          popularity,
          maintenance,
        },
      });

      return response.data.objects.map((obj: any) =>
        NpmPackage.fromJSON(obj.package),
      );
    } catch (error) {
      console.error('Error searching packages:', error);
      throw new Error('Failed to search packages');
    }
  }

  /**
   * Get package details
   */
  async getPackage(packageName: string): Promise<NpmPackage> {
    try {
      const response = await npmClient.getInstance().get(`/${packageName}`);
      return NpmPackage.fromJSON(response.data);
    } catch (error) {
      console.error('Error fetching package details:', error);
      throw new Error('Failed to fetch package details');
    }
  }

  /**
   * Get package download stats
   */
  async getDownloadStats(
    packageName: string,
    period: 'last-day' | 'last-week' | 'last-month' = 'last-week',
  ) {
    try {
      const response = await npmClient
        .getInstance()
        .get(`https://api.npmjs.org/downloads/point/${period}/${packageName}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching download stats:', error);
      return null;
    }
  }

  /**
   * Get package versions
   */
  async getVersions(packageName: string): Promise<string[]> {
    try {
      const response = await npmClient.getInstance().get(`/${packageName}`);
      const versions = response.data.versions;
      return Object.keys(versions || {});
    } catch (error) {
      console.error('Error fetching versions:', error);
      return [];
    }
  }

  /**
   * Search packages by keyword
   */
  async searchByKeyword(
    keyword: string,
    options: NpmSearchOptions = {},
  ): Promise<NpmPackage[]> {
    try {
      const { perPage = 50 } = options;

      const response = await npmClient.getInstance().get('/-/v1/search', {
        params: {
          text: `keywords:${keyword}`,
          size: perPage,
        },
      });

      return response.data.objects.map((obj: any) =>
        NpmPackage.fromJSON(obj.package),
      );
    } catch (error) {
      console.error('Error searching by keyword:', error);
      return [];
    }
  }

  /**
   * Get recently updated packages
   */
  async getRecentlyUpdated(
    limit: number = 20
  ): Promise<NpmPackage[]> {
    try {
      const response = await npmClient.getInstance().get('/-/v1/search', {
        params: {
          text: 'boost-exact:false',
          size: limit,
          from: 0,
          quality: 0.5,
          popularity: 0.8,
          maintenance: 0.9, // Prioritize well-maintained packages
        },
      });

      if (!response.data || !response.data.objects) {
        return [];
      }

      // Sort by modified date (most recent first)
      const sortedObjects = response.data.objects.sort((a: any, b: any) => {
        const dateA = new Date(a.package.date).getTime();
        const dateB = new Date(b.package.date).getTime();
        return dateB - dateA;
      });

      return sortedObjects
        .slice(0, limit)
        .map((obj: any) => NpmPackage.fromJSON(obj.package));
    } catch (error) {
      console.error('Error fetching recently updated packages:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const npmService = new NpmService();
export default npmService;
