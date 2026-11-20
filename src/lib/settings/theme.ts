import type { ThemePreference } from './settings';

/**
 * Reflect the theme preference on <html>. With no attribute the stylesheet
 * follows the system colour scheme (see styles/tokens.css).
 */
export function applyTheme(theme: ThemePreference): void {
  const root = document.documentElement;
  if (theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = theme;
}
