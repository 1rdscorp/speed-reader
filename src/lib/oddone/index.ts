import { pick } from '@/lib/random';
import { THEMES } from '@/lib/wordsearch';

export type OddLevel = 'easy' | 'medium' | 'hard';

/** How many words are shown at each level. */
export const ODD_LEVELS: Record<OddLevel, { label: string; columns: number; rows: number }> = {
  easy: { label: 'Easy', columns: 3, rows: 4 },
  medium: { label: 'Medium', columns: 4, rows: 5 },
  hard: { label: 'Hard', columns: 5, rows: 6 },
};

/** How many odd words there are to find in a game. */
export const ODD_ROUNDS = 10;

/** Letters that are easy to take for one another at a glance. */
const LOOKALIKES: Record<string, string> = {
  ...{ b: 'd', d: 'b', p: 'q', q: 'p', m: 'n', n: 'm', u: 'v', v: 'u' },
  ...{ i: 'l', l: 'i', c: 'e', e: 'c', a: 'o', o: 'a', f: 't', t: 'f', h: 'n', w: 'v', g: 'q' },
};

/** Words long enough to hide a changed letter in, and short enough to take in at a glance. */
const WORDS = [
  ...new Set(
    THEMES.flatMap((theme) => theme.words)
      .filter((word) => word.length >= 4 && word.length <= 7)
      .map((word) => word.toLowerCase())
      .filter((word) => [...word].some((letter) => letter in LOOKALIKES)),
  ),
];

export interface OddRound {
  /** The word shown everywhere but one place. */
  word: string;
  /** The odd one: the word with one letter swapped for a lookalike. */
  odd: string;
  /** Every word shown, row by row. */
  cells: string[];
  /** Where the odd one is among them. */
  oddIndex: number;
}

/** One screenful: the same word over and over, and one that is not quite it. */
export function makeOddRound(level: OddLevel, random: () => number = Math.random): OddRound {
  const { columns, rows } = ODD_LEVELS[level];
  const word = pick(WORDS, random);
  const swappable = [...word].flatMap((letter, i) => (letter in LOOKALIKES ? [i] : []));
  const at = pick(swappable, random);
  const odd = word.slice(0, at) + LOOKALIKES[word[at]!] + word.slice(at + 1);
  const oddIndex = Math.floor(random() * columns * rows);
  const cells = Array.from({ length: columns * rows }, (_, i) => (i === oddIndex ? odd : word));
  return { word, odd, cells, oddIndex };
}
