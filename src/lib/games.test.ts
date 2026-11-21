import { describe, expect, it } from 'vitest';
import { makeOddRound, ODD_LEVELS, type OddLevel } from '@/lib/oddone';
import { pick, shuffled } from '@/lib/random';
import {
  isAnswer,
  makeRound,
  ROUND_LENGTH,
  scramble,
  SCRAMBLE_LEVELS,
  type ScrambleLevel,
} from '@/lib/scramble';
import { seededRandom } from '@/lib/stereograms';
import { THEMES } from '@/lib/wordsearch';

const sorted = (word: string) => [...word].sort().join('');

describe('random helpers', () => {
  it('shuffles without losing or changing anything, and leaves the original alone', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffled(items, seededRandom(2));
    expect(items).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...result].sort()).toEqual(items);
    expect(result).not.toEqual(items);
    expect(shuffled(items, seededRandom(2))).toEqual(result);
  });

  it('picks one of the items', () => {
    const random = seededRandom(4);
    for (let i = 0; i < 20; i += 1)
      expect(['a', 'b', 'c']).toContain(pick(['a', 'b', 'c'], random));
  });
});

describe('word scramble', () => {
  it('scrambles a word into a different order of the same letters', () => {
    const random = seededRandom(1);
    for (const word of ['TIGER', 'BANANA', 'ON', 'LLAMA']) {
      for (let i = 0; i < 20; i += 1) {
        const letters = scramble(word, random);
        expect(letters).not.toBe(word);
        expect(sorted(letters)).toBe(sorted(word));
      }
    }
  });

  it.each(Object.keys(SCRAMBLE_LEVELS) as ScrambleLevel[])(
    'makes a game of ten different words of the right length (%s)',
    (level) => {
      const { shortest, longest } = SCRAMBLE_LEVELS[level];
      for (let seed = 1; seed <= 10; seed += 1) {
        const round = makeRound(level, seededRandom(seed));
        expect(round).toHaveLength(ROUND_LENGTH);
        expect(new Set(round.map((entry) => entry.word)).size).toBe(ROUND_LENGTH);
        for (const { word, theme, letters } of round) {
          expect(word.length).toBeGreaterThanOrEqual(shortest);
          expect(word.length).toBeLessThanOrEqual(longest);
          expect(THEMES.find((candidate) => candidate.name === theme)!.words).toContain(word);
          expect(letters).not.toBe(word);
          expect(sorted(letters)).toBe(sorted(word));
        }
      }
    },
  );

  it('accepts the word however it is typed, and nothing else', () => {
    const entry = { word: 'TIGER', theme: 'Animals', letters: 'GRITE' };
    expect(isAnswer(entry, 'TIGER')).toBe(true);
    expect(isAnswer(entry, '  tiger ')).toBe(true);
    expect(isAnswer(entry, 'GRITE')).toBe(false);
    expect(isAnswer(entry, 'TIGERS')).toBe(false);
    expect(isAnswer(entry, '')).toBe(false);
  });
});

describe('odd one out', () => {
  it.each(Object.keys(ODD_LEVELS) as OddLevel[])(
    'shows one word many times and one lookalike once (%s)',
    (level) => {
      const { columns, rows } = ODD_LEVELS[level];
      const random = seededRandom(9);
      for (let i = 0; i < 40; i += 1) {
        const { word, odd, cells, oddIndex } = makeOddRound(level, random);
        expect(cells).toHaveLength(columns * rows);
        expect(cells[oddIndex]).toBe(odd);
        expect(cells.filter((cell) => cell === word)).toHaveLength(columns * rows - 1);
        // The odd one differs from the rest by exactly one letter.
        expect(odd).toHaveLength(word.length);
        expect([...odd].filter((letter, at) => letter !== word[at])).toHaveLength(1);
        expect(word).toMatch(/^[a-z]{4,7}$/);
      }
    },
  );

  it('puts the odd one in different places', () => {
    const random = seededRandom(5);
    const places = new Set(Array.from({ length: 40 }, () => makeOddRound('easy', random).oddIndex));
    expect(places.size).toBeGreaterThan(6);
  });
});
