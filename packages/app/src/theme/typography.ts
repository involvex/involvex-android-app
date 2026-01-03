/**
 * Hacker Theme Typography
 * Ported from Flutter app: lib/theme/hacker_theme.dart
 * Terminal/monospace font styling
 */

import { Platform, TextStyle } from 'react-native';
import { HackerTheme } from './colors';

// Base terminal text style
const terminal: TextStyle = {
  fontFamily: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),
  letterSpacing: 0.5,
  lineHeight: undefined, // Will be set per style
};

export const Typography = {
  // Heading Styles
  heading1: {
    ...terminal,
    fontSize: 32,
    fontWeight: '700' as const,
    color: HackerTheme.primary,
    letterSpacing: 1.0,
    lineHeight: 44,
  },

  heading2: {
    ...terminal,
    fontSize: 24,
    fontWeight: '600' as const,
    color: HackerTheme.primary,
    letterSpacing: 0.8,
    lineHeight: 33,
  },

  heading3: {
    ...terminal,
    fontSize: 18,
    fontWeight: '500' as const,
    color: HackerTheme.secondary,
    letterSpacing: 0.5,
    lineHeight: 25,
  },

  // Body Text Styles
  bodyText: {
    ...terminal,
    fontSize: 14,
    fontWeight: '400' as const,
    color: HackerTheme.textGrey,
    lineHeight: 20,
  },

  captionText: {
    ...terminal,
    fontSize: 12,
    fontWeight: '400' as const,
    color: HackerTheme.textGrey,
    opacity: 0.7,
    lineHeight: 17,
  },

  // Button Styles
  buttonText: {
    ...terminal,
    fontSize: 16,
    fontWeight: '600' as const,
    color: HackerTheme.darkerGreen,
    letterSpacing: 0.8,
    lineHeight: 22,
  },

  // Code/Technical Text Style
  codeText: {
    fontFamily: Platform.select({
      ios: 'Courier New',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 13,
    fontWeight: '400' as const,
    color: HackerTheme.secondary,
    letterSpacing: 0.3,
    lineHeight: 20,
  },

  // Terminal Text (customizable)
  terminal: (
    fontSize: number = 14,
    weight: '400' | '500' | '600' | '700' = '400',
    color: string = HackerTheme.primary,
    letterSpacing: number = 0.5,
  ): TextStyle => ({
    fontFamily: Platform.select({
      ios: 'Courier New',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize,
    fontWeight: weight,
    color,
    letterSpacing,
    lineHeight: fontSize * 1.4,
  }),
};

export default Typography;
