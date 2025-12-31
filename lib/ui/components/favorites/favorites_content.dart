import 'package:flutter/material.dart';
import '../collapsible_bottomsheet.dart';
import 'package:involvex_app/data/models/log.dart';
import 'package:involvex_app/data/models/project_info.dart';

class FavoritesContent extends StatelessWidget {
  const FavoritesContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.black, Color(0xFF001a00)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                'Favorites',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: Colors.greenAccent,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF002200), Colors.black],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Favorites Header
                  _buildSectionHeader('Your Favorites'),
                  const SizedBox(height: 16),

                  // Repository Favorites
                  _buildPlatformSection(
                    context,
                    'Repositories',
                    'GitHub repositories you\'ve starred',
                    Colors.blueAccent,
                    Icons.favorite,
                    Icons.code,
                  ),

                  const SizedBox(height: 24),

                  // Package Favorites
                  _buildPlatformSection(
                    context,
                    'Packages',
                    'npm packages you\'ve followed',
                    Colors.orangeAccent,
                    Icons.favorite,
                    Icons.inventory_2,
                  ),

                  const SizedBox(height: 24),

                  // Quick Actions
                  _buildQuickActions(context),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: TextStyle(
        color: Colors.greenAccent,
        fontSize: 24,
        fontWeight: FontWeight.bold,
        shadows: [
          Shadow(
            color: Colors.greenAccent.withOpacity(0.3),
            blurRadius: 4,
            offset: const Offset(0, 0),
          ),
        ],
      ),
    );
  }

  Widget _buildPlatformSection(
    BuildContext context,
    String title,
    String subtitle,
    Color accentColor,
    IconData icon,
    IconData platformIcon,
  ) {
    return Card(
      elevation: 8,
      shadowColor: accentColor.withOpacity(0.3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: accentColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            colors: [
              Colors.black87,
              Color(0xFF001100),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: InkWell(
          onTap: () => _showFavoritesList(context, title),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: accentColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: accentColor.withOpacity(0.5),
                      width: 1,
                    ),
                  ),
                  child: Icon(
                    platformIcon,
                    color: accentColor,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  color: accentColor,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Quick Actions'),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionButton(
                context,
                'Sync Favorites',
                Icons.sync,
                Colors.greenAccent,
                () => _syncFavorites(context),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildQuickActionButton(
                context,
                'Export Data',
                Icons.download,
                Colors.blueAccent,
                () => _exportData(context),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionButton(
    BuildContext context,
    String label,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return ElevatedButton(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: color.withOpacity(0.1),
        foregroundColor: color,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(
            color: color.withOpacity(0.3),
            width: 1,
          ),
        ),
        padding: const EdgeInsets.symmetric(vertical: 12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  void _showFavoritesList(BuildContext context, String platform) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FavoritesListBottomSheet(platform: platform),
    );
  }

  void _syncFavorites(BuildContext context) {
    // TODO: Implement favorites synchronization
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Syncing favorites...'),
        backgroundColor: Colors.greenAccent,
      ),
    );
  }

  void _exportData(BuildContext context) {
    // TODO: Implement data export
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Exporting data...'),
        backgroundColor: Colors.blueAccent,
      ),
    );
  }
}

class FavoritesListBottomSheet extends StatelessWidget {
  final String platform;

  const FavoritesListBottomSheet({super.key, required this.platform});

  @override
  Widget build(BuildContext context) {
    return CollapsibleBottomSheet(
      title: '$platform Favorites',
      logs: const <Log>[],
      projectInfo: ProjectInfo(endpoint: '', projectId: '', projectName: ''),
    );
  }

  Widget _buildFavoriteItem(
    BuildContext context,
    String name,
    String description,
    int stars,
    String language,
    String license,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.greenAccent.withOpacity(0.2),
          child: Icon(Icons.code, color: Colors.greenAccent),
        ),
        title: Text(
          name,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              description,
              style: TextStyle(color: Colors.white70),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.star, size: 14, color: Colors.amber),
                const SizedBox(width: 4),
                Text(
                  stars.toString(),
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
                const SizedBox(width: 12),
                Icon(Icons.code, size: 14, color: Colors.blueAccent),
                const SizedBox(width: 4),
                Text(
                  language,
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
                const SizedBox(width: 12),
                Icon(Icons.gavel, size: 14, color: Colors.orangeAccent),
                const SizedBox(width: 4),
                Text(
                  license,
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.more_vert, color: Colors.white70),
          onPressed: () => _showItemOptions(context),
        ),
      ),
    );
  }

  void _showItemOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF001100),
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.open_in_new, color: Colors.greenAccent),
              title: const Text('Open in Browser'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.star_border, color: Colors.amber),
              title: const Text('Remove from Favorites'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.share, color: Colors.blueAccent),
              title: const Text('Share'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}
