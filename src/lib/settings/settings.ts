import { DEFAULT_WPM, clampWpm } from '@/core';

export type ThemePreference = 'system' | 'light' | 'dark';

/**
 * Every user preference. To add one: add the field, its default, and a line in
 * `sanitize`. Saved settings are merged over the defaults, so existing users
 * pick up new fields without a migration.
 */
export interface Settings {
  wpm: number;
  theme: ThemePreference;
}

export const DEFAULT_SETTINGS: Settings = {
  wpm: DEFAULT_WPM,
  theme: 'system',
};

const THEMES: readonly ThemePreference[] = ['system', 'light', 'dark'];

/** Coerce anything read from storage into valid settings. */
export function sanitize(saved: unknown): Settings {
  const input = (typeof saved === 'object' && saved !== null ? saved : {}) as Partial<
    Record<keyof Settings, unknown>
  >;
  return {
    wpm: typeof input.wpm === 'number' ? clampWpm(input.wpm) : DEFAULT_SETTINGS.wpm,
    theme: THEMES.includes(input.theme as ThemePreference)
      ? (input.theme as ThemePreference)
      : DEFAULT_SETTINGS.theme,
  };
}
