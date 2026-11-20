import { graphemes } from './graphemes';

/** A word divided around its pivot: the letter the eye should rest on. */
export interface PivotSplit {
  before: string;
  pivot: string;
  after: string;
}

const WORD_CHARACTER = /[\p{L}\p{N}]/u;

/**
 * Find the "optimal recognition point" of a word. Words are recognised fastest
 * when the eye lands a little left of centre, so the pivot sits about a third
 * of the way in. Surrounding punctuation is ignored when measuring.
 */
export function splitAtPivot(word: string): PivotSplit {
  const chars = graphemes(word);
  if (chars.length === 0) return { before: '', pivot: '', after: '' };

  let first = chars.findIndex((char) => WORD_CHARACTER.test(char));
  let last = chars.findLastIndex((char) => WORD_CHARACTER.test(char));
  if (first === -1) {
    first = 0;
    last = chars.length - 1;
  }

  const index = first + pivotOffset(last - first + 1);
  return {
    before: chars.slice(0, index).join(''),
    pivot: chars[index] ?? '',
    after: chars.slice(index + 1).join(''),
  };
}

function pivotOffset(length: number): number {
  if (length <= 1) return 0;
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  if (length <= 13) return 3;
  return 4;
}
