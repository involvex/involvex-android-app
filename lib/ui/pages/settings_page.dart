import 'package:involvex_app/data/models/user_settings.dart';
import 'package:involvex_app/theme/hacker_theme.dart';
import 'package:flutter/material.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  late UserSettings _settings;
  bool _hasChanges = false;

  @override
  void initState() {
    super.initState();
    _settings = UserSettings();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    // Load settings from SharedPreferences or Appwrite
    // For now, using default settings
    setState(() {
      _settings = UserSettings();
    });
  }

  void _updateSettings(UserSettings newSettings) {
    setState(() {
      _settings = newSettings;
      _hasChanges = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HackerTheme.darkerGreen,
      appBar: AppBar(
        title: const Text('Settings'),
        elevation: 0,
        backgroundColor: HackerTheme.darkerGreen,
        foregroundColor: HackerTheme.primaryGreen,
        actions: [
          if (_hasChanges)
            IconButton(
              icon: const Icon(Icons.save),
              onPressed: _saveSettings,
              color: HackerTheme.primaryGreen,
            ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _resetToDefaults,
            color: HackerTheme.textGrey,
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              children: [
                _buildSectionHeader('Account'),
                _buildDiscordAuthCard(),
                _buildAccountInfoCard(),
                
                _buildSectionHeader('Appearance'),
                _buildThemeSettingsCard(),
                
                _buildSectionHeader('Trending'),
                _buildTrendingSettingsCard(),
                
                _buildSectionHeader('Notifications'),
                _buildNotificationSettingsCard(),
                
                _buildSectionHeader('Display'),
                _buildDisplaySettingsCard(),
                
                _buildSectionHeader('Filters & Sorting'),
                _buildFilterSettingsCard(),
                
                _buildSectionHeader('Data Management'),
                _buildDataManagementCard(),
                
                _buildSectionHeader('Advanced'),
                _buildAdvancedSettingsCard(),
                
                const SizedBox(height: 100), // Extra space for bottom navigation
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _hasChanges
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: HackerTheme.darkGrey,
                border: Border(
                  top: BorderSide(color: HackerTheme.lightGrey, width: 1),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _discardChanges,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: HackerTheme.textGrey,
                        side: BorderSide(color: HackerTheme.lightGrey),
                      ),
                      child: const Text('Discard Changes'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _saveSettings,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: HackerTheme.primaryGreen,
                        foregroundColor: HackerTheme.darkerGreen,
                      ),
                      child: const Text('Save Changes'),
                    ),
                  ),
                ],
              ),
            )
          : null,
    );
  }

  Widget _buildSectionHeader(String title) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title,
        style: HackerTheme.heading3().copyWith(
          color: HackerTheme.secondaryGreen,
          fontSize: 16,
        ),
      ),
    );
  }

  Widget _buildDiscordAuthCard() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.discord, color: HackerTheme.primaryGreen, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Discord Integration',
                    style: HackerTheme.heading3(),
                  ),
                ),
                if (_settings.isDiscordConnected)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: HackerTheme.accentGreen.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: HackerTheme.accentGreen),
                    ),
                    child: Text(
                      'Connected',
                      style: HackerTheme.captionText().copyWith(
                        color: HackerTheme.accentGreen,
                        fontSize: 10,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'Connect your Discord account for enhanced synchronization and notifications.',
              style: HackerTheme.bodyText(),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                if (_settings.isDiscordConnected) ...[
                  CircleAvatar(
                    backgroundImage: NetworkImage(_settings.discordAvatarUrl ?? ''),
                    radius: 16,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _settings.discordUsername ?? 'Unknown',
                          style: HackerTheme.bodyText().copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          _settings.discordEmail ?? '',
                          style: HackerTheme.captionText(),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  OutlinedButton(
                    onPressed: _disconnectDiscord,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: HackerTheme.errorRed,
                      side: BorderSide(color: HackerTheme.errorRed),
                    ),
                    child: const Text('Disconnect'),
                  ),
                ] else ...[
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _connectDiscord,
                      icon: const Icon(Icons.link),
                      label: const Text('Connect Discord'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: HackerTheme.primaryGreen,
                        foregroundColor: HackerTheme.darkerGreen,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountInfoCard() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Account Information', style: HackerTheme.heading3()),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(Icons.person, color: HackerTheme.primaryGreen),
              title: Text('User Profile', style: HackerTheme.bodyText()),
              subtitle: Text('Manage your profile and preferences', style: HackerTheme.captionText()),
              trailing: Icon(Icons.chevron_right, color: HackerTheme.textGrey),
              onTap: _manageProfile,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(Icons.security, color: HackerTheme.primaryGreen),
              title: Text('Privacy Settings', style: HackerTheme.bodyText()),
              subtitle: Text('Control your data and privacy', style: HackerTheme.captionText()),
              trailing: Icon(Icons.chevron_right, color: HackerTheme.textGrey),
              onTap: _managePrivacy,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeSettingsCard() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Theme & Appearance', style: HackerTheme.heading3()),
            const SizedBox(height: 16),
            SwitchListTile(
              title: Text('Dark Mode', style: HackerTheme.bodyText()),
              subtitle: Text('Use dark theme throughout the app', style: HackerTheme.captionText()),
              value: _settings.isDarkMode,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(isDarkMode: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Hacker Theme', style: HackerTheme.bodyText()),
              subtitle: Text('Use the signature green hacker aesthetic', style: HackerTheme.captionText()),
              value: _settings.useHackerTheme,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(useHackerTheme: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text('Theme Color', style: HackerTheme.bodyText()),
              subtitle: Text('Primary color scheme', style: HackerTheme.captionText()),
              trailing: DropdownButton<String>(
                value: _settings.themeColor,
                items: [
                  DropdownMenuItem(value: 'primary', child: Text('Green')),
                  DropdownMenuItem(value: 'blue', child: Text('Blue')),
                  DropdownMenuItem(value: 'purple', child: Text('Purple')),
                  DropdownMenuItem(value: 'orange', child: Text('Orange')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    _updateSettings(_settings.copyWith(themeColor: value));
                  }
                },
                underline: SizedBox.shrink(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTrendingSettingsCard() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Trending Settings', style: HackerTheme.heading3()),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text('Default Timeframe', style: HackerTheme.bodyText()),
              subtitle: Text('Choose default trending period', style: HackerTheme.captionText()),
              trailing: DropdownButton<String>(
                value: _settings.trendingTimeframe,
                items: [
                  DropdownMenuItem(value: 'daily', child: Text('Daily')),
                  DropdownMenuItem(value: 'weekly', child: Text('Weekly')),
                  DropdownMenuItem(value: 'monthly', child: Text('Monthly')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    _updateSettings(_settings.copyWith(trendingTimeframe: value));
                  }
                },
                underline: SizedBox.shrink(),
              ),
            ),
            SwitchListTile(
              title: Text('Show GitHub Trending', style: HackerTheme.bodyText()),
              subtitle: Text('Display GitHub repositories in trending', style: HackerTheme.captionText()),
              value: _settings.showGitHubTrending,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(showGitHubTrending: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Show npm Trending', style: HackerTheme.bodyText()),
              subtitle: Text('Display npm packages in trending', style: HackerTheme.captionText()),
              value: _settings.showNpmTrending,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(showNpmTrending: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Auto Refresh', style: HackerTheme.bodyText()),
              subtitle: Text('Automatically refresh trending data', style: HackerTheme.captionText()),
              value: _settings.autoRefresh,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(autoRefresh: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            if (_settings.autoRefresh)
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text('Refresh Interval', style: HackerTheme.bodyText()),
                subtitle: Text('${_settings.refreshInterval} minutes', style: HackerTheme.captionText()),
                trailing: Slider(
                  value: _settings.refreshInterval.toDouble(),
                  min: 15,
                  max: 240,
                  divisions: 45,
                  activeColor: HackerTheme.primaryGreen,
                  onChanged: (value) {
                    _updateSettings(_settings.copyWith(refreshInterval: value.round()));
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationSettingsCard() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Notifications', style: HackerTheme.heading3()),
            const SizedBox(height: 16),
            SwitchListTile(
              title: Text('Push Notifications', style: HackerTheme.bodyText()),
              subtitle: Text('Enable push notifications', style: HackerTheme.captionText()),
              value: _settings.enablePushNotifications,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(enablePushNotifications: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            if (_settings.enablePushNotifications) ...[
              SwitchListTile(
                title: Text('New Release Notifications', style: HackerTheme.bodyText()),
                subtitle: Text('Notify about new releases for subscribed items', style: HackerTheme.captionText()),
                value: _settings.enableNewReleaseNotifications,
                onChanged: (value) {
                  _updateSettings(_settings.copyWith(enableNewReleaseNotifications: value));
                },
                activeThumbColor: HackerTheme.primaryGreen,
                contentPadding: EdgeInsets.zero,
              ),
              SwitchListTile(
                title: Text('Trending Notifications', style: HackerTheme.bodyText()),
                subtitle: Text('Notify about trending repositories and packages', style: HackerTheme.captionText()),
                value: _settings.enableTrendingNotifications,
                onChanged: (value) {
                  _updateSettings(_settings.copyWith(enableTrendingNotifications: value));
                },
                activeThumbColor: HackerTheme.primaryGreen,
                contentPadding: EdgeInsets.zero,
              ),
              SwitchListTile(
                title: Text('Daily Digest', style: HackerTheme.bodyText()),
                subtitle: Text('Daily summary of trending items', style: HackerTheme.captionText()),
                value: _settings.enableDailyDigest,
                onChanged: (value) {
                  _updateSettings(_settings.copyWith(enableDailyDigest: value));
                },
                activeThumbColor: HackerTheme.primaryGreen,
                contentPadding: EdgeInsets.zero,
              ),
              SwitchListTile(
                title: Text('Weekly Summary', style: HackerTheme.bodyText()),
                subtitle: Text('Weekly summary of your activity', style: HackerTheme.captionText()),
                value: _settings.enableWeeklySummary,
                onChanged: (value) {
                  _updateSettings(_settings.copyWith(enableWeeklySummary: value));
                },
                activeThumbColor: HackerTheme.primaryGreen,
                contentPadding: EdgeInsets.zero,
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text('Notification Time', style: HackerTheme.bodyText()),
                subtitle: Text('Daily digest delivery time', style: HackerTheme.captionText()),
                trailing: TextButton(
                  onPressed: _pickNotificationTime,
                  child: Text(_settings.notificationTime),
                ),
              ),
              SwitchListTile(
                title: Text('Vibration', style: HackerTheme.bodyText()),
                subtitle: Text('Vibrate for notifications', style: HackerTheme.captionText()),
                value: _settings.enableVibration,
                onChanged: (value) {
                  _updateSettings(_settings.copyWith(enableVibration: value));
                },
                activeThumbColor: HackerTheme.primaryGreen,
                contentPadding: EdgeInsets.zero,
              ),
              SwitchListTile(
                title: Text('Sound', style: HackerTheme.bodyText()),
                subtitle: Text('Play sound for notifications', style: HackerTheme.captionText()),
                value: _settings.enableSound,
                onChanged: (value) {
                  _updateSettings(_settings.copyWith(enableSound: value));
                },
                activeThumbColor: HackerTheme.primaryGreen,
                contentPadding: EdgeInsets.zero,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDisplaySettingsCard() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Display Options', style: HackerTheme.heading3()),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text('Items Per Page', style: HackerTheme.bodyText()),
              subtitle: Text('${_settings.itemsPerPage} items', style: HackerTheme.captionText()),
              trailing: Slider(
                value: _settings.itemsPerPage.toDouble(),
                min: 10,
                max: 100,
                divisions: 9,
                activeColor: HackerTheme.primaryGreen,
                onChanged: (value) {
                  _updateSettings(_settings.copyWith(itemsPerPage: value.round()));
                },
              ),
            ),
            SwitchListTile(
              title: Text('Compact View', style: HackerTheme.bodyText()),
              subtitle: Text('Show more items in less space', style: HackerTheme.captionText()),
              value: _settings.compactView,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(compactView: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Show Descriptions', style: HackerTheme.bodyText()),
              subtitle: Text('Display item descriptions', style: HackerTheme.captionText()),
              value: _settings.showDescriptions,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(showDescriptions: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Show Stars/Forks', style: HackerTheme.bodyText()),
              subtitle: Text('Display star and fork counts', style: HackerTheme.captionText()),
              value: _settings.showStars && _settings.showForks,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(
                  showStars: value,
                  showForks: value,
                ));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Show Last Updated', style: HackerTheme.bodyText()),
              subtitle: Text('Display last update timestamps', style: HackerTheme.captionText()),
              value: _settings.showLastUpdated,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(showLastUpdated: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Show License', style: HackerTheme.bodyText()),
              subtitle: Text('Display license information', style: HackerTheme.captionText()),
              value: _settings.showLicense,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(showLicense: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Show Topics', style: HackerTheme.bodyText()),
              subtitle: Text('Display repository/package topics', style: HackerTheme.captionText()),
              value: _settings.showTopics,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(showTopics: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterSettingsCard() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Filters & Sorting', style: HackerTheme.heading3()),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text('Sort By', style: HackerTheme.bodyText()),
              subtitle: Text(_formatSortOption(_settings.sortBy), style: HackerTheme.captionText()),
              trailing: DropdownButton<String>(
                value: _settings.sortBy,
                items: [
                  DropdownMenuItem(value: 'trending_score', child: Text('Trending Score')),
                  DropdownMenuItem(value: 'stars', child: Text('Stars')),
                  DropdownMenuItem(value: 'date', child: Text('Date')),
                  DropdownMenuItem(value: 'name', child: Text('Name')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    _updateSettings(_settings.copyWith(sortBy: value));
                  }
                },
                underline: SizedBox.shrink(),
              ),
            ),
            SwitchListTile(
              title: Text('Sort Ascending', style: HackerTheme.bodyText()),
              subtitle: Text('Sort in ascending order', style: HackerTheme.captionText()),
              value: _settings.sortAscending,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(sortAscending: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text('Minimum Stars', style: HackerTheme.bodyText()),
              subtitle: Text('${_settings.minStars}+ stars', style: HackerTheme.captionText()),
              trailing: Slider(
                value: _settings.minStars.toDouble(),
                min: 0,
                max: 10000,
                divisions: 20,
                activeColor: HackerTheme.primaryGreen,
                onChanged: (value) {
                  _updateSettings(_settings.copyWith(minStars: value.round()));
                },
              ),
            ),
            SwitchListTile(
              title: Text('Include Forks', style: HackerTheme.bodyText()),
              subtitle: Text('Include forked repositories', style: HackerTheme.captionText()),
              value: _settings.includeForks,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(includeForks: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Include Archived', style: HackerTheme.bodyText()),
              subtitle: Text('Include archived repositories', style: HackerTheme.captionText()),
              value: _settings.includeArchived,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(includeArchived: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDataManagementCard() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Data Management', style: HackerTheme.heading3()),
            const SizedBox(height: 16),
            SwitchListTile(
              title: Text('Offline Mode', style: HackerTheme.bodyText()),
              subtitle: Text('Enable offline caching', style: HackerTheme.captionText()),
              value: _settings.enableOfflineMode,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(enableOfflineMode: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text('Cache Expiry', style: HackerTheme.bodyText()),
              subtitle: Text('${_settings.cacheExpiryHours} hours', style: HackerTheme.captionText()),
              trailing: Slider(
                value: _settings.cacheExpiryHours.toDouble(),
                min: 1,
                max: 168,
                divisions: 167,
                activeColor: HackerTheme.primaryGreen,
                onChanged: (value) {
                  _updateSettings(_settings.copyWith(cacheExpiryHours: value.round()));
                },
              ),
            ),
            SwitchListTile(
              title: Text('Auto Delete Old Data', style: HackerTheme.bodyText()),
              subtitle: Text('Automatically clean old cached data', style: HackerTheme.captionText()),
              value: _settings.autoDeleteOldData,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(autoDeleteOldData: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text('Max Cache Size', style: HackerTheme.bodyText()),
              subtitle: Text('${_settings.maxCacheSize} MB', style: HackerTheme.captionText()),
              trailing: Slider(
                value: _settings.maxCacheSize.toDouble(),
                min: 50,
                max: 1000,
                divisions: 19,
                activeColor: HackerTheme.primaryGreen,
                onChanged: (value) {
                  _updateSettings(_settings.copyWith(maxCacheSize: value.round()));
                },
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _exportData,
                    icon: const Icon(Icons.download),
                    label: const Text('Export Data'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: HackerTheme.primaryGreen,
                      side: BorderSide(color: HackerTheme.primaryGreen),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _clearCache,
                    icon: const Icon(Icons.clear_all),
                    label: const Text('Clear Cache'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: HackerTheme.warningOrange,
                      side: BorderSide(color: HackerTheme.warningOrange),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdvancedSettingsCard() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Advanced', style: HackerTheme.heading3()),
            const SizedBox(height: 16),
            SwitchListTile(
              title: Text('Debug Mode', style: HackerTheme.bodyText()),
              subtitle: Text('Enable debug logging and information', style: HackerTheme.captionText()),
              value: _settings.enableDebugMode,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(enableDebugMode: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Beta Features', style: HackerTheme.bodyText()),
              subtitle: Text('Enable experimental features', style: HackerTheme.captionText()),
              value: _settings.enableBetaFeatures,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(enableBetaFeatures: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Share Usage Data', style: HackerTheme.bodyText()),
              subtitle: Text('Help improve the app with anonymous usage data', style: HackerTheme.captionText()),
              value: _settings.shareUsageData,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(shareUsageData: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            SwitchListTile(
              title: Text('Analytics', style: HackerTheme.bodyText()),
              subtitle: Text('Enable analytics tracking', style: HackerTheme.captionText()),
              value: _settings.enableAnalytics,
              onChanged: (value) {
                _updateSettings(_settings.copyWith(enableAnalytics: value));
              },
              activeThumbColor: HackerTheme.primaryGreen,
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(Icons.info, color: HackerTheme.primaryGreen),
              title: Text('About', style: HackerTheme.bodyText()),
              subtitle: Text('App version and information', style: HackerTheme.captionText()),
              trailing: Icon(Icons.chevron_right, color: HackerTheme.textGrey),
              onTap: _showAboutDialog,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(Icons.help, color: HackerTheme.primaryGreen),
              title: Text('Help & Support', style: HackerTheme.bodyText()),
              subtitle: Text('Get help and contact support', style: HackerTheme.captionText()),
              trailing: Icon(Icons.chevron_right, color: HackerTheme.textGrey),
              onTap: _showHelpDialog,
            ),
          ],
        ),
      ),
    );
  }

  // Action methods
  void _saveSettings() async {
    // Save to SharedPreferences or Appwrite
    _showSnackBar('Settings saved successfully');
    setState(() {
      _hasChanges = false;
    });
  }

  void _resetToDefaults() {
    setState(() {
      _settings = UserSettings();
      _hasChanges = true;
    });
  }

  void _discardChanges() {
    _loadSettings();
    setState(() {
      _hasChanges = false;
    });
  }

  void _connectDiscord() {
    // Implement Discord OAuth2 flow
    _showSnackBar('Discord OAuth2 integration - Coming soon!');
  }

  void _disconnectDiscord() {
    _updateSettings(_settings.copyWith(
      discordUserId: null,
      discordUsername: null,
      discordAvatarUrl: null,
      discordEmail: null,
      isDiscordConnected: false,
    ));
  }

  void _pickNotificationTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(DateTime.parse('2023-01-01 ${_settings.notificationTime}:00')),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.dark(
              primary: HackerTheme.primaryGreen,
              surface: HackerTheme.darkGrey,
              onPrimary: HackerTheme.darkerGreen,
            ),
          ),
          child: child!,
        );
      },
    );

    if (time != null) {
      final timeString = '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
      _updateSettings(_settings.copyWith(notificationTime: timeString));
    }
  }

  void _exportData() {
    _showSnackBar('Data export - Coming soon!');
  }

  void _clearCache() {
    _showSnackBar('Cache cleared');
  }

  void _manageProfile() {
    _showSnackBar('Profile management - Coming soon!');
  }

  void _managePrivacy() {
    _showSnackBar('Privacy settings - Coming soon!');
  }

  void _showAboutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: HackerTheme.darkGrey,
        title: Text('About Trending Hub', style: HackerTheme.heading3()),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Version: 1.0.0', style: HackerTheme.bodyText()),
            const SizedBox(height: 8),
            Text(
              'A comprehensive app for tracking trending GitHub repositories and npm packages with Discord integration.',
              style: HackerTheme.bodyText(),
            ),
            const SizedBox(height: 16),
            Text('Features:', style: HackerTheme.heading3()),
            const SizedBox(height: 8),
            Text('• Trending repositories and packages', style: HackerTheme.bodyText()),
            Text('• Subscription management', style: HackerTheme.bodyText()),
            Text('• Advanced search and filters', style: HackerTheme.bodyText()),
            Text('• Discord OAuth2 integration', style: HackerTheme.bodyText()),
            Text('• Push notifications', style: HackerTheme.bodyText()),
            Text('• Dark hacker theme', style: HackerTheme.bodyText()),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close', style: HackerTheme.bodyText()),
          ),
        ],
      ),
    );
  }

  void _showHelpDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: HackerTheme.darkGrey,
        title: Text('Help & Support', style: HackerTheme.heading3()),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Need help?', style: HackerTheme.heading3()),
            const SizedBox(height: 8),
            Text(
              'If you encounter any issues or have questions, please contact support.',
              style: HackerTheme.bodyText(),
            ),
            const SizedBox(height: 16),
            Text('Quick Tips:', style: HackerTheme.heading3()),
            const SizedBox(height: 8),
            Text('• Tap the bookmark icon to subscribe to repositories/packages', style: HackerTheme.bodyText()),
            Text('• Use the search bar to find specific items', style: HackerTheme.bodyText()),
            Text('• Configure notifications in Settings', style: HackerTheme.bodyText()),
            Text('• Connect Discord for enhanced features', style: HackerTheme.bodyText()),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close', style: HackerTheme.bodyText()),
          ),
        ],
      ),
    );
  }

  String _formatSortOption(String option) {
    switch (option) {
      case 'trending_score':
        return 'Trending Score';
      case 'stars':
        return 'Stars';
      case 'date':
        return 'Date';
      case 'name':
        return 'Name';
      default:
        return option;
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: HackerTheme.primaryGreen,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}