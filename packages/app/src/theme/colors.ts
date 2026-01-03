/**
 * Hacker Theme Colors
 * Ported from Flutter app: lib/theme/hacker_theme.dart
 * Matrix-style dark green terminal aesthetic
 */

export const HackerTheme = {
  // Dark Green Color Palette - "Matrix/Hacker" Theme
  primary: '#00FF41', // Classic terminal green
  secondary: '#39FF14', // Bright green
  darkGreen: '#0A3D0A', // Dark background green
  darkerGreen: '#051A05', // Very dark green
  background: '#051A05', // Alias for background
  accentGreen: '#1AFF66', // Accent green
  accent: '#39FF14', // Alias for secondary

  // Neutral Colors
  pureBlack: '#000000',
  darkGrey: '#1A1A1A',
  mediumGrey: '#2D2D2D',
  lightGrey: '#404040',
  textGrey: '#B8B8B8',

  // Status Colors
  errorRed: '#FF4444',
  warningOrange: '#FF8800',
  successGreen: '#00FF41',

  // Light Theme Colors (optional)
  lightPrimaryGreen: '#006633',
  lightSecondaryGreen: '#009944',
  lightBackground: '#F5FFF5',
  lightSurface: '#E8F5E8',
  lightOnPrimary: '#FFFFFF',
  lightOnSecondary: '#FFFFFF',
  lightOnSurface: '#1A1A1A',

  // Programming Language Colors (for repository cards)
  languages: {
    JavaScript: '#F1E05A',
    TypeScript: '#2B7489',
    Python: '#3572A5',
    Java: '#B07219',
    'C++': '#F34B7D',
    C: '#555555',
    'C#': '#178600',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#DEA584',
    Swift: '#FFAC45',
    Kotlin: '#F18E33',
    Dart: '#00B4AB',
    Shell: '#89E051',
    HTML: '#E34C26',
    CSS: '#563D7C',
    Vue: '#4FC08D',
    React: '#61DAFB',
    Angular: '#DD0031',
    Docker: '#384D54',
    YAML: '#CB171E',
    JSON: '#292929',
  },
};

/**
 * Get language color with fallback
 */
export const getLanguageColor = (language: string): string => {
  return (
    HackerTheme.languages[language as keyof typeof HackerTheme.languages] ||
    '#CCCCCC'
  );
};

export default HackerTheme;
