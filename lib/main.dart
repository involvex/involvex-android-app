import 'package:appwrite_flutter_starter_kit/app.dart';
import 'package:appwrite_flutter_starter_kit/utils/app_initializer.dart';
import 'package:flutter/material.dart';

void main() async {
  await AppInitializer.initialize();
  runApp(AppwriteApp());
}
