import { THEMES, type Theme } from './words';

export interface Cell {
  row: number;
  col: number;
}

/** A step from one cell to the next: each part is -1, 0 or 1. */
export interface Direction {
  rowStep: number;
  colStep: number;
}

/** A word and where it lies in the grid. */
export interface Placement extends Direction {
  word: string;
  start: Cell;
  end: Cell;
}

export interface Puzzle {
  theme: string;
  size: number;
  /** The letters, row by row. */
  grid: string[][];
  /** The hidden words, in the order they are listed. */
  placements: Placement[];
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Level {
  label: string;
  size: number;
  words: number;
  directions: Direction[];
  /** Points for each letter of a word found. */
  pointsPerLetter: number;
  /** What the level asks of you, in a few words. */
  summary: string;
}

const RIGHT = { rowStep: 0, colStep: 1 };
const DOWN = { rowStep: 1, colStep: 0 };
const DOWN_RIGHT = { rowStep: 1, colStep: 1 };
const UP_RIGHT = { rowStep: -1, colStep: 1 };
const LEFT = { rowStep: 0, colStep: -1 };
const UP = { rowStep: -1, colStep: 0 };
const UP_LEFT = { rowStep: -1, colStep: -1 };
const DOWN_LEFT = { rowStep: 1, colStep: -1 };
const ALL = [RIGHT, DOWN, DOWN_RIGHT, UP_RIGHT, LEFT, UP, UP_LEFT, DOWN_LEFT];

export const LEVELS: Record<Difficulty, Level> = {
  easy: {
    label: 'Easy',
    size: 8,
    words: 6,
    directions: [RIGHT, DOWN, DOWN_RIGHT, UP_RIGHT],
    pointsPerLetter: 10,
    summary: 'Words read left to right, top to bottom, or along a diagonal.',
  },
  medium: {
    label: 'Medium',
    size: 10,
    words: 9,
    directions: [RIGHT, DOWN, DOWN_RIGHT, UP_RIGHT, LEFT, UP],
    pointsPerLetter: 20,
    summary: 'Some words also run backwards or bottom to top.',
  },
  hard: {
    label: 'Hard',
    size: 12,
    words: 12,
    directions: ALL,
    pointsPerLetter: 30,
    summary: 'Words run in all eight directions.',
  },
};

/** Short words nobody wants to find by accident among the filler letters. */
const UNWANTED = ['ASS', 'SEX', 'FUCK', 'SHIT', 'DAMN', 'HELL', 'CRAP', 'PISS', 'DICK', 'COCK'];
const UNWANTED_TOO = ['TIT', 'FAG', 'CUNT', 'SLUT', 'RAPE', 'NAZI', 'KILL', 'DEAD', 'ANUS', 'PORN'];

const EMPTY = '';

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

const reversed = (word: string) => [...word].reverse().join('');

/** Every straight run of letters in the grid: its rows, columns and diagonals, each read one way. */
function lines(grid: string[][]): string[] {
  const size = grid.length;
  const result: string[] = [];
  const walk = (row: number, col: number, { rowStep, colStep }: Direction) => {
    let line = '';
    for (; row >= 0 && row < size && col >= 0 && col < size; row += rowStep, col += colStep) {
      line += grid[row]![col];
    }
    result.push(line);
  };
  for (let i = 0; i < size; i += 1) {
    walk(i, 0, RIGHT);
    walk(0, i, DOWN);
    walk(0, i, DOWN_RIGHT);
    walk(size - 1, i, UP_RIGHT);
    if (i > 0) {
      walk(i, 0, DOWN_RIGHT);
      walk(size - 1 - i, 0, UP_RIGHT);
    }
  }
  return result;
}

/** How many times `word` can be read in the grid, forwards or backwards. */
export function occurrences(grid: string[][], word: string): number {
  const backwards = reversed(word);
  let count = 0;
  for (const line of lines(grid)) {
    for (const target of backwards === word ? [word] : [word, backwards]) {
      for (let at = line.indexOf(target); at !== -1; at = line.indexOf(target, at + 1)) count += 1;
    }
  }
  return count;
}

/** Try to lay the words into an empty grid, crossing where letters agree. */
function place(words: string[], level: Level, random: () => number): Placement[] | undefined {
  const { size } = level;
  const grid = Array.from({ length: size }, () => Array<string>(size).fill(EMPTY));
  const placements: Placement[] = [];

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 300 && !placed; attempt += 1) {
      const direction = level.directions[Math.floor(random() * level.directions.length)]!;
      const start = { row: Math.floor(random() * size), col: Math.floor(random() * size) };
      const end = {
        row: start.row + direction.rowStep * (word.length - 1),
        col: start.col + direction.colStep * (word.length - 1),
      };
      if (end.row < 0 || end.row >= size || end.col < 0 || end.col >= size) continue;

      const cells = [...word].map((letter, i) => ({
        letter,
        row: start.row + direction.rowStep * i,
        col: start.col + direction.colStep * i,
      }));
      if (cells.some(({ letter, row, col }) => ![EMPTY, letter].includes(grid[row]![col]!))) {
        continue;
      }
      for (const { letter, row, col } of cells) grid[row]![col] = letter;
      placements.push({ word, start, end, ...direction });
      placed = true;
    }
    if (!placed) return undefined;
  }
  return placements;
}

/** The grid with the placed words written in and every other cell empty. */
function written(size: number, placements: Placement[]): string[][] {
  const grid = Array.from({ length: size }, () => Array<string>(size).fill(EMPTY));
  for (const { word, start, rowStep, colStep } of placements) {
    [...word].forEach((letter, i) => {
      grid[start.row + rowStep * i]![start.col + colStep * i] = letter;
    });
  }
  return grid;
}

/**
 * Choose words from the theme that can share a puzzle: none may sit inside
 * another, forwards or backwards, or it could be found twice.
 */
function choose(theme: Theme, count: number, size: number, random: () => number): string[] {
  const chosen: string[] = [];
  for (const word of shuffled(theme.words, random)) {
    if (word.length > size) continue;
    const clashes = chosen.some((other) =>
      [word, reversed(word)].some((form) => other.includes(form) || form.includes(other)),
    );
    if (!clashes) chosen.push(word);
    if (chosen.length === count) break;
  }
  return chosen;
}

/**
 * Make a puzzle: words from one theme hidden in a square of letters, each
 * findable in exactly one place. `random` decides everything, so the same
 * sequence of numbers always makes the same puzzle.
 */
export function generatePuzzle(difficulty: Difficulty, random: () => number = Math.random): Puzzle {
  const level = LEVELS[difficulty];
  for (;;) {
    const theme = THEMES[Math.floor(random() * THEMES.length)]!;
    const words = choose(theme, level.words, level.size, random);
    // Longest first: long words are the hardest to fit, short ones slot in around them.
    const placements = place(
      [...words].sort((a, b) => b.length - a.length),
      level,
      random,
    );
    if (!placements) continue;

    // The spare cells get letters from the words themselves, so nothing stands out.
    const letters = words.join('');
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const grid = written(level.size, placements).map((row) =>
        row.map((letter) => letter || letters[Math.floor(random() * letters.length)]!),
      );
      const clean =
        words.every((word) => occurrences(grid, word) === 1) &&
        [...UNWANTED, ...UNWANTED_TOO].every((word) => occurrences(grid, word) === 0);
      if (clean) {
        // Listed in a shuffled order, so the list does not hint at where the long words are.
        return {
          theme: theme.name,
          size: level.size,
          grid,
          placements: shuffled(placements, random),
        };
      }
    }
  }
}

/**
 * The straight line from `from` towards `to`: exactly to it when the two are
 * in line, otherwise along the nearest of the eight directions, as far as the
 * further of the two distances and no further than the edge of the grid.
 */
export function lineTowards(from: Cell, to: Cell, size: number): Cell[] {
  const rows = to.row - from.row;
  const cols = to.col - from.col;
  if (rows === 0 && cols === 0) return [from];
  // Which of the eight directions the drag is closest to.
  const octant = Math.round(Math.atan2(rows, cols) / (Math.PI / 4));
  const direction = [RIGHT, DOWN_RIGHT, DOWN, DOWN_LEFT, LEFT, UP_LEFT, UP, UP_RIGHT][
    (octant + 8) % 8
  ]!;
  const cells: Cell[] = [];
  for (let i = 0; i <= Math.max(Math.abs(rows), Math.abs(cols)); i += 1) {
    const cell = { row: from.row + direction.rowStep * i, col: from.col + direction.colStep * i };
    if (cell.row < 0 || cell.row >= size || cell.col < 0 || cell.col >= size) break;
    cells.push(cell);
  }
  return cells;
}

/**
 * The hidden word a line of cells marks, if any. The line may be drawn from
 * either end of the word.
 */
export function wordAlong(puzzle: Puzzle, cells: Cell[]): Placement | undefined {
  const first = cells[0];
  const last = cells[cells.length - 1];
  if (!first || !last) return undefined;
  const same = (a: Cell, b: Cell) => a.row === b.row && a.col === b.col;
  return puzzle.placements.find(
    ({ word, start, end }) =>
      word.length === cells.length &&
      ((same(start, first) && same(end, last)) || (same(start, last) && same(end, first))),
  );
}
