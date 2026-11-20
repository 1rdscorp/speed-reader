import type { Theme } from './settings';

/** Show the site in a theme, by marking <html>. index.html does the same before first paint. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}
