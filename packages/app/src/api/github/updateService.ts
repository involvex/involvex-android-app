/**
 * Update Service
 * Checks for new app versions on GitHub
 */

import axios from 'axios';
import { Alert, Linking } from 'react-native';
import pkg from '../../../package.json';

const GITHUB_RELEASES_URL = 'https://api.github.com/repos/involvex/involvex-android-app/releases/latest';

export interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

class UpdateService {
  /**
   * Check for updates and alert the user if a new version is available
   */
  async checkForUpdates(manual: boolean = false): Promise<void> {
    try {
      const response = await axios.get<GitHubRelease>(GITHUB_RELEASES_URL);
      const latestRelease = response.data;
      const latestVersion = latestRelease.tag_name.replace('v', '');
      const currentVersion = pkg.version;

      if (this.isNewerVersion(currentVersion, latestVersion)) {
        this.showUpdateAlert(latestVersion, latestRelease);
      } else if (manual) {
        Alert.alert('No Updates', `You are running the latest version (${currentVersion}).`);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      if (manual) {
        Alert.alert('Error', 'Failed to check for updates. Please check your connection.');
      }
    }
  }

  /**
   * Compare version strings (e.g., "0.0.3" vs "0.0.4")
   */
  private isNewerVersion(current: string, latest: string): boolean {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const c = currentParts[i] || 0;
      const l = latestParts[i] || 0;
      if (l > c) return true;
      if (l < c) return false;
    }
    return false;
  }

  /**
   * Show update alert with download options
   */
  private showUpdateAlert(version: string, release: GitHubRelease): void {
    Alert.alert(
      'Update Available',
      `A new version (${version}) of Involvex is available. Would you like to download it?`,
      [
        { text: 'Later', style: 'cancel' },
        { 
          text: 'View Release', 
          onPress: () => Linking.openURL(release.html_url) 
        },
        { 
          text: 'Download APK', 
          onPress: () => {
            const apkAsset = release.assets.find(a => a.name.endsWith('.apk'));
            if (apkAsset) {
              Linking.openURL(apkAsset.browser_download_url);
            } else {
              Linking.openURL(release.html_url);
            }
          },
          style: 'default'
        },
      ]
    );
  }
}

export const updateService = new UpdateService();
export default updateService;
