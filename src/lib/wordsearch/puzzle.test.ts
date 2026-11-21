import { describe, expect, it } from 'vitest';
import { seededRandom } from '@/lib/stereograms';
import {
  generatePuzzle,
  LEVELS,
  lineTowards,
  occurrences,
  UNWANTED,
  wordAlong,
  type Difficulty,
} from './puzzle';
import { THEMES } from './words';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

describe('word lists', () => {
  it('hold enough short, distinct words for the hardest puzzle', () => {
    for (const { name, words } of THEMES) {
      expect(new Set(words).size, name).toBe(words.length);
      expect(words.length, name).toBeGreaterThanOrEqual(LEVELS.hard.words + 6);
      for (const word of words) expect(word, name).toMatch(/^[A-Z]{3,8}$/);
    }
  });

  it('cover two dozen themes, each named once', () => {
    expect(THEMES).toHaveLength(24);
    expect(new Set(THEMES.map((theme) => theme.name)).size).toBe(24);
  });

  it('hold no word with an unwanted word inside it, which could never be placed', () => {
    for (const { words } of THEMES) {
      for (const word of words) {
        const backwards = [...word].reverse().join('');
        for (const unwanted of UNWANTED) {
          expect(word.includes(unwanted) || backwards.includes(unwanted), word).toBe(false);
        }
      }
    }
  });
});

describe('generatePuzzle', () => {
  it.each(DIFFICULTIES)('hides every listed word exactly once (%s)', (difficulty) => {
    const level = LEVELS[difficulty];
    for (let seed = 1; seed <= 25; seed += 1) {
      const puzzle = generatePuzzle(difficulty, seededRandom(seed));
      expect(puzzle.size).toBe(level.size);
      expect(puzzle.grid).toHaveLength(level.size);
      expect(puzzle.grid.flat().join('')).toMatch(new RegExp(`^[A-Z]{${level.size ** 2}}$`));
      expect(puzzle.placements).toHaveLength(level.words);

      const theme = THEMES.find((candidate) => candidate.name === puzzle.theme)!;
      for (const { word, start, end, rowStep, colStep } of puzzle.placements) {
        expect(theme.words).toContain(word);
        // The word really is where the puzzle says it is,
        const read = [...word]
          .map((_, i) => puzzle.grid[start.row + rowStep * i]![start.col + colStep * i])
          .join('');
        expect(read).toBe(word);
        expect(end).toEqual({
          row: start.row + rowStep * (word.length - 1),
          col: start.col + colStep * (word.length - 1),
        });
        // it runs in a direction the level allows,
        expect(level.directions).toContainEqual({ rowStep, colStep });
        // and it cannot be found anywhere else.
        expect(occurrences(puzzle.grid, word)).toBe(1);
      }
    }
  });

  it('can make a puzzle from every theme', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 400 && seen.size < THEMES.length; seed += 1) {
      seen.add(generatePuzzle('hard', seededRandom(seed)).theme);
    }
    expect([...seen].sort()).toEqual(THEMES.map((theme) => theme.name).sort());
  });

  it('takes a different theme from the puzzle before when told what that was', () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const first = generatePuzzle('easy', seededRandom(seed));
      expect(generatePuzzle('easy', seededRandom(seed), first.theme).theme).not.toBe(first.theme);
    }
  });

  it('makes the same puzzle from the same random numbers, and a different one otherwise', () => {
    const first = generatePuzzle('medium', seededRandom(7));
    expect(generatePuzzle('medium', seededRandom(7))).toEqual(first);
    expect(generatePuzzle('medium', seededRandom(8))).not.toEqual(first);
  });
});

describe('occurrences', () => {
  const grid = ['CAT', 'AXA', 'TAC'].map((row) => [...row]);

  it('counts a word along rows, columns and diagonals, forwards and backwards', () => {
    // Top row, left column, bottom row backwards, right column backwards.
    expect(occurrences(grid, 'CAT')).toBe(4);
    expect(occurrences(grid, 'CXC')).toBe(1);
    expect(occurrences(grid, 'DOG')).toBe(0);
  });
});

describe('lineTowards', () => {
  it('runs straight to a cell that is in line', () => {
    expect(lineTowards({ row: 2, col: 1 }, { row: 2, col: 4 }, 8)).toEqual([
      { row: 2, col: 1 },
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      { row: 2, col: 4 },
    ]);
    expect(lineTowards({ row: 5, col: 5 }, { row: 3, col: 3 }, 8)).toEqual([
      { row: 5, col: 5 },
      { row: 4, col: 4 },
      { row: 3, col: 3 },
    ]);
    expect(lineTowards({ row: 1, col: 1 }, { row: 1, col: 1 }, 8)).toEqual([{ row: 1, col: 1 }]);
  });

  it('snaps a crooked drag to the nearest direction and stops at the edge', () => {
    // Mostly across, a little down: treated as across.
    expect(lineTowards({ row: 0, col: 0 }, { row: 1, col: 5 }, 8)).toHaveLength(6);
    expect(lineTowards({ row: 0, col: 0 }, { row: 1, col: 5 }, 8).at(-1)).toEqual({
      row: 0,
      col: 5,
    });
    // A diagonal that would leave the grid is cut off at its edge.
    expect(lineTowards({ row: 6, col: 0 }, { row: 3, col: 7 }, 8).at(-1)).toEqual({
      row: 0,
      col: 6,
    });
    expect(lineTowards({ row: 6, col: 4 }, { row: 2, col: 7 }, 8).at(-1)).toEqual({
      row: 3,
      col: 7,
    });
  });
});

describe('wordAlong', () => {
  const puzzle = generatePuzzle('easy', seededRandom(3));
  const placement = puzzle.placements[0]!;
  const cells = lineTowards(placement.start, placement.end, puzzle.size);

  it('recognises a hidden word marked from either end', () => {
    expect(wordAlong(puzzle, cells)).toBe(placement);
    expect(wordAlong(puzzle, [...cells].reverse())).toBe(placement);
  });

  it('rejects a line that stops short or is not a word', () => {
    expect(wordAlong(puzzle, cells.slice(0, -1))).toBeUndefined();
    expect(wordAlong(puzzle, [])).toBeUndefined();
  });
});
