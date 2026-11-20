import { DEFAULT_WPM, MAX_WORDS_PER_FRAME, clampWpm } from '@/core';

export const MIN_FONT_SIZE = 32;
export const MAX_FONT_SIZE = 80;
export const FONT_SIZE_STEP = 4;

/**
 * Every user preference. To add one: add the field, its default, and a line in
 * `sanitize`. Saved settings are merged over the defaults, so existing users
 * pick up new fields without a migration.
 */
export interface Settings {
  wpm: number;
  /** How many words are shown at once. */
  wordsPerFrame: number;
  /** Size of the word on the reading stage, in CSS pixels. */
  fontSize: number;
  /** Light text on a dark reading area. */
  darkReader: boolean;
  /** Linger after commas, sentences and paragraphs. */
  punctuationPauses: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  wpm: DEFAULT_WPM,
  wordsPerFrame: 1,
  fontSize: 56,
  darkReader: false,
  punctuationPauses: true,
};

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Coerce anything read from storage into valid settings. */
export function sanitize(saved: unknown): Settings {
  const input = (typeof saved === 'object' && saved !== null ? saved : {}) as Partial<
    Record<keyof Settings, unknown>
  >;
  const flag = (value: unknown, fallback: boolean) =>
    typeof value === 'boolean' ? value : fallback;
  return {
    wpm: typeof input.wpm === 'number' ? clampWpm(input.wpm) : DEFAULT_SETTINGS.wpm,
    wordsPerFrame: clamp(
      input.wordsPerFrame,
      1,
      MAX_WORDS_PER_FRAME,
      DEFAULT_SETTINGS.wordsPerFrame,
    ),
    fontSize: clamp(input.fontSize, MIN_FONT_SIZE, MAX_FONT_SIZE, DEFAULT_SETTINGS.fontSize),
    darkReader: flag(input.darkReader, DEFAULT_SETTINGS.darkReader),
    punctuationPauses: flag(input.punctuationPauses, DEFAULT_SETTINGS.punctuationPauses),
  };
}
