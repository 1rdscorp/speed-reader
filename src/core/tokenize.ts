import { graphemes } from './graphemes';

/** What follows a token. Drives pauses and sentence navigation. */
export type Boundary = 'none' | 'clause' | 'sentence' | 'paragraph';

/** One unit of text shown on the reading stage. */
export interface Token {
  /** Text as displayed. Differs from the source only for split long words, which gain a hyphen. */
  text: string;
  /** Character offsets into the source text: start inclusive, end exclusive. */
  start: number;
  end: number;
  /** Zero-based index of the paragraph the token belongs to. */
  paragraph: number;
  boundary: Boundary;
  /** True when this is a piece of a long word that carries on in the next token. */
  continues: boolean;
}

/** Longest stretch of characters shown at once; longer words are split so they fit the stage. */
export const MAX_TOKEN_LENGTH = 13;

const WORD = /\S+/g;
const BLANK_LINE = /\n[^\S\n]*\n/;
/** A word may be glued to the next by an em dash ("this—that"); the dash stays with the left part. */
const EM_DASH_PIECES = /[^—]+—*|—+/g;
/** Free-standing dashes and ellipses are a beat in the rhythm rather than something to read. */
const PAUSE_MARK = /^(?:[-‒–—―]+|…+|\.{2,})$/;
/** List bullets and similar decoration carry no content. */
const DECORATION = /^[•·▪◦‣*]+$/;
const TRAILING_CLOSERS = /["'”’»)\]}]+$/;
const LEADING_OPENERS = /^["'“‘«([{]+/;
const LOWERCASE_START = /^["'“‘«([{]*\p{Ll}/u;
const DOTTED_ACRONYM = /^(?:\p{L}\.)+\p{L}$/u;
const INITIAL = /^\p{Lu}$/u;

/**
 * Abbreviations that are normally followed by a capitalised word or a number,
 * so the "next word is lower-case" check in `tokenize` cannot catch them.
 */
const ABBREVIATIONS = new Set([
  ...['mr', 'mrs', 'ms', 'mx', 'dr', 'prof', 'sr', 'jr', 'st', 'mt'],
  ...['gen', 'col', 'lt', 'sgt', 'capt', 'rev', 'hon'],
  ...['vs', 'fig', 'vol', 'ch', 'pp', 'eq', 'approx', 'ca', 'cf'],
]);

/**
 * Turn raw text into the sequence of tokens the reader steps through.
 *
 * Words are whitespace-delimited. A blank line starts a new paragraph; a single
 * line break is treated as ordinary whitespace so hard-wrapped text reads normally.
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let paragraph = 0;
  let previousEnd = 0;

  for (const match of text.matchAll(WORD)) {
    const wordStart = match.index;
    let last = tokens.at(-1);

    if (last && BLANK_LINE.test(text.slice(previousEnd, wordStart))) {
      last.boundary = 'paragraph';
      paragraph += 1;
    }
    previousEnd = wordStart + match[0].length;

    for (const piece of match[0].matchAll(EM_DASH_PIECES)) {
      const raw = piece[0];
      const start = wordStart + piece.index;
      last = tokens.at(-1);

      if (DECORATION.test(raw)) continue;
      if (PAUSE_MARK.test(raw)) {
        if (last?.boundary === 'none') last.boundary = 'clause';
        continue;
      }
      // "approx. five", "e.g. this": a full stop followed by a lower-case word was not a sentence end.
      if (
        last?.boundary === 'sentence' &&
        endsWithFullStop(last.text) &&
        LOWERCASE_START.test(raw)
      ) {
        last.boundary = 'none';
      }

      const boundary = boundaryAfter(raw);
      const fragments = splitLongWord(raw);
      fragments.forEach((fragment, i) => {
        const isLast = i === fragments.length - 1;
        tokens.push({
          text: fragment.text,
          start: start + fragment.start,
          end: start + fragment.end,
          paragraph,
          boundary: isLast ? boundary : 'none',
          continues: !isLast,
        });
      });
    }
  }

  const final = tokens.at(-1);
  if (final) final.boundary = 'paragraph';
  return tokens;
}

/** Number of words in a text, counted the same way `tokenize` splits them. */
export function countWords(text: string): number {
  let count = 0;
  for (const token of tokenize(text)) {
    if (!token.continues) count += 1;
  }
  return count;
}

function endsWithFullStop(word: string): boolean {
  const core = word.replace(TRAILING_CLOSERS, '');
  return core.endsWith('.') && !core.endsWith('..');
}

function boundaryAfter(word: string): Boundary {
  const core = word.replace(TRAILING_CLOSERS, '');
  const last = core.at(-1);
  if (last === undefined) return 'none';
  if (last === '!' || last === '?') return 'sentence';
  // A trailing ellipsis is a beat, but the sentence often carries on.
  if (last === '…' || core.endsWith('..')) return 'clause';
  if (last === '.') return isAbbreviation(core) ? 'none' : 'sentence';
  if (last === ',' || last === ';' || last === ':' || last === '—' || last === '–') return 'clause';
  return 'none';
}

function isAbbreviation(wordWithFullStop: string): boolean {
  const stem = wordWithFullStop.slice(0, -1).replace(LEADING_OPENERS, '');
  if (ABBREVIATIONS.has(stem.toLowerCase())) return true;
  if (DOTTED_ACRONYM.test(stem)) return true; // U.S. / e.g. / a.m.
  // A lone capital is an initial ("J. R. R. Tolkien"), except "I", which usually ends a sentence.
  return INITIAL.test(stem) && stem !== 'I';
}

interface Fragment {
  text: string;
  start: number;
  end: number;
}

/**
 * Break a word that is too long for the stage into pieces of at most
 * MAX_TOKEN_LENGTH characters, preferring existing hyphens and slashes.
 * Offsets are relative to the start of the word.
 */
function splitLongWord(word: string): Fragment[] {
  if (word.length <= MAX_TOKEN_LENGTH) return [{ text: word, start: 0, end: word.length }];
  const chars = graphemes(word);
  if (chars.length <= MAX_TOKEN_LENGTH) return [{ text: word, start: 0, end: word.length }];

  // 1. Cut after natural break characters.
  const segments: string[][] = [];
  let current: string[] = [];
  chars.forEach((char, i) => {
    current.push(char);
    if ((char === '-' || char === '/' || char === '_') && i < chars.length - 1) {
      segments.push(current);
      current = [];
    }
  });
  segments.push(current);

  // 2. Pack neighbouring segments together while they fit ("state-of-the-" + "art").
  const packed: string[][] = [];
  for (const segment of segments) {
    const previous = packed.at(-1);
    if (previous && previous.length + segment.length <= MAX_TOKEN_LENGTH) {
      previous.push(...segment);
    } else {
      packed.push([...segment]);
    }
  }

  // 3. Anything still too long is cut into near-equal parts, marked with a hyphen.
  const fragments: Fragment[] = [];
  let offset = 0;
  const push = (part: string[], addHyphen: boolean) => {
    const source = part.join('');
    fragments.push({
      text: addHyphen ? `${source}-` : source,
      start: offset,
      end: offset + source.length,
    });
    offset += source.length;
  };
  for (const chunk of packed) {
    if (chunk.length <= MAX_TOKEN_LENGTH) {
      push(chunk, false);
      continue;
    }
    const room = MAX_TOKEN_LENGTH - 1; // leave space for the hyphen
    const parts = Math.ceil(chunk.length / room);
    const size = Math.ceil(chunk.length / parts);
    for (let i = 0; i < chunk.length; i += size) {
      push(chunk.slice(i, i + size), i + size < chunk.length);
    }
  }
  return fragments;
}
