import 'package:involvex_app/app.dart';
import 'package:involvex_app/utils/app_initializer.dart';
import 'package:flutter/material.dart';

void main() async {
  await AppInitializer.initialize();
  runApp(AppwriteApp());
}
