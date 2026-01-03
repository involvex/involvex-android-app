/**
 * Hacker Theme Colors
 * Shared across mobile (React Native) and web (Cloudflare Pages)
 * Matrix-style dark green terminal aesthetic
 */

export const HackerTheme = {
  // Dark Green Color Palette - "Matrix/Hacker" Theme
  primary: '#00FF41', // Classic terminal green
  secondary: '#39FF14', // Bright green
  darkGreen: '#0A3D0A', // Dark background green
  darkerGreen: '#051A05', // Very dark green
  accentGreen: '#1AFF66', // Accent green

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
} as const;

/**
 * Get language color with fallback
 */
export const getLanguageColor = (language: string): string => {
  return (
    HackerTheme.languages[language as keyof typeof HackerTheme.languages] ||
    '#CCCCCC'
  );
};

/**
 * CSS Variables for web use (Tailwind, CSS-in-JS, etc.)
 */
export const cssVariables = {
  '--color-primary': HackerTheme.primary,
  '--color-secondary': HackerTheme.secondary,
  '--color-dark-green': HackerTheme.darkGreen,
  '--color-darker-green': HackerTheme.darkerGreen,
  '--color-accent-green': HackerTheme.accentGreen,
  '--color-pure-black': HackerTheme.pureBlack,
  '--color-dark-grey': HackerTheme.darkGrey,
  '--color-medium-grey': HackerTheme.mediumGrey,
  '--color-light-grey': HackerTheme.lightGrey,
  '--color-text-grey': HackerTheme.textGrey,
  '--color-error-red': HackerTheme.errorRed,
  '--color-warning-orange': HackerTheme.warningOrange,
  '--color-success-green': HackerTheme.successGreen,
} as const;

/**
 * Tailwind color configuration
 */
export const tailwindColors = {
  hacker: {
    primary: HackerTheme.primary,
    secondary: HackerTheme.secondary,
    'dark-green': HackerTheme.darkGreen,
    'darker-green': HackerTheme.darkerGreen,
    'accent-green': HackerTheme.accentGreen,
  },
  neutral: {
    'pure-black': HackerTheme.pureBlack,
    'dark-grey': HackerTheme.darkGrey,
    'medium-grey': HackerTheme.mediumGrey,
    'light-grey': HackerTheme.lightGrey,
    'text-grey': HackerTheme.textGrey,
  },
  status: {
    error: HackerTheme.errorRed,
    warning: HackerTheme.warningOrange,
    success: HackerTheme.successGreen,
  },
} as const;

export default HackerTheme;
