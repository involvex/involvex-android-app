/**
 * Hacker Theme Index
 * Centralized theme exports
 */

export { HackerTheme, getLanguageColor } from './colors';
export { Typography } from './typography';
export { Spacing } from './spacing';
export { glowEffect, glowBorder, Gradients } from './shadows';

// Re-export default theme
import { HackerTheme } from './colors';
export default HackerTheme;
