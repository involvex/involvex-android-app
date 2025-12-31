import 'package:flutter/material.dart';
import '../components/favorites/favorites_content.dart';

class FavoritesPage extends StatelessWidget {
  const FavoritesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: const FavoritesContent(),
    );
  }
}
