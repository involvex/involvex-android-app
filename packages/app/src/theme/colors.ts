/**
 * Hacker Theme Colors
 * Ported from Flutter app: lib/theme/hacker_theme.dart
 * Matrix-style dark green terminal aesthetic
 */

export const HackerTheme = {
  // Hacker Theme Palette
  // The accent stays terminal green, but the *surfaces* are now near-black
  // instead of dark green so the chrome (tab bar, headers, cards) reads as a
  // neutral terminal and the green is reserved for accents/active states.
  primary: "#00FF41", // Classic terminal green
  secondary: "#39FF14", // Bright green
  darkGreen: "#141414", // Surface / raised background (was #0A3D0A)
  darkerGreen: "#0A0A0A", // App background (was #051A05)
  accentGreen: "#1AFF66", // Accent green

  // Neutral Colors
  pureBlack: "#000000",
  darkGrey: "#1A1A1A",
  mediumGrey: "#2D2D2D",
  lightGrey: "#404040",
  textGrey: "#B8B8B8",

  // Status Colors
  errorRed: "#FF4444",
  warningOrange: "#FF8800",
  successGreen: "#00FF41",

  // Light Theme Colors (optional)
  lightPrimaryGreen: "#006633",
  lightSecondaryGreen: "#009944",
  lightBackground: "#F5FFF5",
  lightSurface: "#E8F5E8",
  lightOnPrimary: "#FFFFFF",
  lightOnSecondary: "#FFFFFF",
  lightOnSurface: "#1A1A1A",

  // Programming Language Colors (for repository cards)
  languages: {
    JavaScript: "#F1E05A",
    TypeScript: "#2B7489",
    Python: "#3572A5",
    Java: "#B07219",
    "C++": "#F34B7D",
    C: "#555555",
    "C#": "#178600",
    PHP: "#4F5D95",
    Ruby: "#701516",
    Go: "#00ADD8",
    Rust: "#DEA584",
    Swift: "#FFAC45",
    Kotlin: "#F18E33",
    Dart: "#00B4AB",
    Shell: "#89E051",
    HTML: "#E34C26",
    CSS: "#563D7C",
    Vue: "#4FC08D",
    React: "#61DAFB",
    Angular: "#DD0031",
    Docker: "#384D54",
    YAML: "#CB171E",
    JSON: "#292929",
  },
};

/**
 * Get language color with fallback
 */
export const getLanguageColor = (language: string): string => {
  return (
    HackerTheme.languages[language as keyof typeof HackerTheme.languages] ||
    "#CCCCCC"
  );
};

export default HackerTheme;
