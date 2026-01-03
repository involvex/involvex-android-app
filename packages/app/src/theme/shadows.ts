/**
 * Shadow Effects
 * Ported from Flutter app: lib/theme/hacker_theme.dart
 * Glow effects for Hacker Theme
 */

import { ViewStyle } from 'react-native';
import { HackerTheme } from './colors';

/**
 * Create glow effect (box shadow) for components
 * Replicates Flutter's BoxDecoration.boxShadow
 */
export const glowEffect = (
  color: string = HackerTheme.primary,
  blurRadius: number = 10,
): ViewStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: blurRadius,
  elevation: 5, // Android
});

/**
 * Border with glow
 */
export const glowBorder = (
  color: string = HackerTheme.primary,
  blurRadius: number = 10,
): ViewStyle => ({
  borderWidth: 1,
  borderColor: color,
  borderRadius: 8,
  ...glowEffect(color, blurRadius),
});

/**
 * Gradient definitions (for LinearGradient component)
 */
export const Gradients = {
  primary: {
    colors: [
      HackerTheme.darkerGreen,
      HackerTheme.darkGreen,
      HackerTheme.mediumGrey,
    ],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  accent: {
    colors: [HackerTheme.primary, HackerTheme.accentGreen],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },

  background: {
    colors: [HackerTheme.darkerGreen, HackerTheme.darkGreen],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

export default { glowEffect, glowBorder, Gradients };
