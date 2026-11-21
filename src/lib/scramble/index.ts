import { shuffled } from '@/lib/random';
import { THEMES } from '@/lib/wordsearch';

export type ScrambleLevel = 'easy' | 'medium' | 'hard';

/** How long the words are at each level, and what unscrambling one is worth. */
export const SCRAMBLE_LEVELS: Record<
  ScrambleLevel,
  { label: string; shortest: number; longest: number; points: number }
> = {
  easy: { label: 'Easy', shortest: 4, longest: 5, points: 10 },
  medium: { label: 'Medium', shortest: 6, longest: 6, points: 20 },
  hard: { label: 'Hard', shortest: 7, longest: 8, points: 30 },
};

/** How many words make a game. */
export const ROUND_LENGTH = 10;

export interface ScrambledWord {
  word: string;
  /** The clue: the theme the word belongs to. */
  theme: string;
  /** The word's letters, out of order. */
  letters: string;
}

const sorted = (word: string) => [...word].sort().join('');

/** The word's letters in a different order: never the word itself. */
export function scramble(word: string, random: () => number = Math.random): string {
  // A word made of one repeated letter has no other order; no listed word is like that.
  if (new Set(word).size < 2) return word;
  for (;;) {
    const letters = shuffled([...word], random).join('');
    if (letters !== word) return letters;
  }
}

/** Ten different words for one game, each with its theme as a clue. */
export function makeRound(
  level: ScrambleLevel,
  random: () => number = Math.random,
): ScrambledWord[] {
  const { shortest, longest } = SCRAMBLE_LEVELS[level];
  const seen = new Set<string>();
  const candidates: Array<{ word: string; theme: string }> = [];
  for (const theme of THEMES) {
    for (const word of theme.words) {
      // A word listed under two themes is offered once, under the first.
      if (word.length < shortest || word.length > longest || seen.has(word)) continue;
      seen.add(word);
      candidates.push({ word, theme: theme.name });
    }
  }
  return shuffled(candidates, random)
    .slice(0, ROUND_LENGTH)
    .map((entry) => ({ ...entry, letters: scramble(entry.word, random) }));
}

/**
 * Whether a guess unscrambles the letters: the word itself, or another word
 * of the same theme that happens to use the same letters.
 */
export function isAnswer(entry: ScrambledWord, guess: string): boolean {
  const attempt = guess.trim().toUpperCase();
  if (attempt === entry.word) return true;
  const theme = THEMES.find((candidate) => candidate.name === entry.theme);
  return sorted(attempt) === sorted(entry.word) && (theme?.words.includes(attempt) ?? false);
}
