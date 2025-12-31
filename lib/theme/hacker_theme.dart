import 'package:flutter/material.dart';

class HackerTheme {
  // Dark Green Color Palette - "Matrix/ Hacker" Theme
  static const Color primaryGreen = Color(0xFF00FF41); // Classic terminal green
  static const Color secondaryGreen = Color(0xFF39FF14); // Bright green
  static const Color darkGreen = Color(0xFF0A3D0A); // Dark background green
  static const Color darkerGreen = Color(0xFF051A05); // Very dark green
  static const Color accentGreen = Color(0xFF1AFF66); // Accent green

  // Neutral Colors
  static const Color pureBlack = Color(0xFF000000);
  static const Color darkGrey = Color(0xFF1A1A1A);
  static const Color mediumGrey = Color(0xFF2D2D2D);
  static const Color lightGrey = Color(0xFF404040);
  static const Color textGrey = Color(0xFFB8B8B8);
  static const Color errorRed = Color(0xFFFF4444);
  static const Color warningOrange = Color(0xFFFF8800);
  static const Color successGreen = Color(0xFF00FF41);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [darkerGreen, darkGreen, mediumGrey],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [primaryGreen, accentGreen],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  // Glow Effects
  static BoxDecoration glowEffect({Color? color, double blurRadius = 10.0}) {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: color ?? primaryGreen, width: 1),
      boxShadow: [
        BoxShadow(
          color: (color ?? primaryGreen).withOpacity(0.3),
          blurRadius: blurRadius,
          spreadRadius: 1,
        ),
      ],
    );
  }

  // Terminal/Console Text Style
  static TextStyle terminalText({
    double? fontSize,
    FontWeight? weight,
    Color? color,
    double letterSpacing = 0.5,
  }) {
    return TextStyle(
      fontFamily: 'JetBrains Mono', // Fallback to monospace
      fontSize: fontSize ?? 14,
      fontWeight: weight ?? FontWeight.w400,
      color: color ?? primaryGreen,
      letterSpacing: letterSpacing,
      height: 1.4,
    );
  }

  // Heading Styles
  static TextStyle heading1() {
    return terminalText(
      fontSize: 32,
      weight: FontWeight.bold,
      color: primaryGreen,
      letterSpacing: 1.0,
    );
  }

  static TextStyle heading2() {
    return terminalText(
      fontSize: 24,
      weight: FontWeight.w600,
      color: primaryGreen,
      letterSpacing: 0.8,
    );
  }

  static TextStyle heading3() {
    return terminalText(
      fontSize: 18,
      weight: FontWeight.w500,
      color: secondaryGreen,
      letterSpacing: 0.5,
    );
  }

  // Body Text Styles
  static TextStyle bodyText() {
    return terminalText(
      fontSize: 14,
      weight: FontWeight.w400,
      color: textGrey,
    );
  }

  static TextStyle captionText() {
    return terminalText(
      fontSize: 12,
      weight: FontWeight.w400,
      color: textGrey.withOpacity(0.7),
    );
  }

  // Button Styles
  static TextStyle buttonText() {
    return terminalText(
      fontSize: 16,
      weight: FontWeight.w600,
      color: darkerGreen,
      letterSpacing: 0.8,
    );
  }

  // Code/Technical Text Style
  static TextStyle codeText() {
    return TextStyle(
      fontFamily: 'Fira Code', // Fallback to monospace
      fontSize: 13,
      fontWeight: FontWeight.w400,
      color: secondaryGreen,
      letterSpacing: 0.3,
      height: 1.5,
    );
  }

  // Light Theme Colors
  static const lightPrimaryGreen = Color(0xFF006633);
  static const lightSecondaryGreen = Color(0xFF009944);
  static const lightBackground = Color(0xFFF5FFF5);
  static const lightSurface = Color(0xFFE8F5E8);
  static const lightOnPrimary = Color(0xFFFFFFFF);
  static const lightOnSecondary = Color(0xFFFFFFFF);
  static const lightOnSurface = Color(0xFF1A1A1A);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,

      // Color Scheme
      colorScheme: const ColorScheme.dark(
        primary: primaryGreen,
        secondary: secondaryGreen,
        surface: darkGrey,
        onPrimary: pureBlack,
        onSecondary: pureBlack,
        onSurface: textGrey,
        error: errorRed,
        onError: pureBlack,
      ),

      // App Bar Theme
      appBarTheme: AppBarTheme(
        backgroundColor: darkerGreen,
        foregroundColor: primaryGreen,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: const TextStyle(
          fontFamily: 'JetBrains Mono',
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: primaryGreen,
        ),
        iconTheme: const IconThemeData(color: primaryGreen, size: 24),
        actionsIconTheme: const IconThemeData(color: primaryGreen, size: 24),
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: darkGrey,
        elevation: 4,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),

      // Elevated Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: darkerGreen,
          elevation: 2,
          shadowColor: primaryGreen.withOpacity(0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: buttonText(),
        ),
      ),

      // Outlined Button Theme
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryGreen,
          side: const BorderSide(color: primaryGreen, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: buttonText(),
        ),
      ),

      // Text Button Theme
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: secondaryGreen,
          textStyle: buttonText(),
        ),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: mediumGrey,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: lightGrey),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: lightGrey),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: primaryGreen, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: errorRed),
        ),
        labelStyle: const TextStyle(color: textGrey),
        hintStyle: TextStyle(color: textGrey.withOpacity(0.6)),
      ),

      // Bottom Navigation Bar Theme
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: darkerGreen,
        selectedItemColor: primaryGreen,
        unselectedItemColor: textGrey,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),

      // Floating Action Button Theme
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryGreen,
        foregroundColor: darkerGreen,
        elevation: 6,
      ),

      // Chip Theme
      chipTheme: ChipThemeData(
        backgroundColor: mediumGrey,
        selectedColor: primaryGreen.withOpacity(0.2),
        labelStyle: captionText(),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: lightGrey),
        ),
      ),

      // Progress Indicator Theme
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: primaryGreen,
        linearTrackColor: mediumGrey,
      ),

      // Switch Theme
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return primaryGreen;
          }
          return mediumGrey;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return primaryGreen.withOpacity(0.3);
          }
          return mediumGrey;
        }),
      ),

      // Divider Theme
      dividerTheme: const DividerThemeData(
        color: lightGrey,
        thickness: 1,
        space: 1,
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,

      colorScheme: const ColorScheme.light(
        primary: lightPrimaryGreen,
        secondary: lightSecondaryGreen,
        surface: lightSurface,
        onPrimary: lightOnPrimary,
        onSecondary: lightOnSecondary,
        onSurface: lightOnSurface,
      ),

      appBarTheme: const AppBarTheme(
        backgroundColor: lightSurface,
        foregroundColor: lightPrimaryGreen,
        elevation: 2,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontFamily: 'JetBrains Mono',
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: lightPrimaryGreen,
        ),
      ),

      // Update other theme properties for light mode as needed
    );
  }
}

// Custom Extensions for Easy Access
extension HackerThemeExtension on BuildContext {
  HackerTheme get hackerTheme => HackerTheme();
}
