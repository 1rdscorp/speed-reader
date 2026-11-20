import { splitAtCentre, splitAtPivot, type PivotSplit } from './orp';
import type { Token } from './tokenize';

/** What is on the stage at one moment: one word, or a few when reading several at a time. */
export interface Frame {
  text: string;
  /** Indexes of the first and last token shown. */
  first: number;
  last: number;
}

export const MAX_WORDS_PER_FRAME = 3;

/**
 * Group tokens into the frames the reader steps through. With one word per
 * frame each token is its own frame. With more, words are shown together,
 * but never across the end of a sentence: the pause belongs between them.
 */
export function buildFrames(tokens: readonly Token[], wordsPerFrame = 1): Frame[] {
  if (wordsPerFrame <= 1) {
    return tokens.map((token, index) => ({ text: token.text, first: index, last: index }));
  }
  const frames: Frame[] = [];
  let first = 0;
  while (first < tokens.length) {
    let last = first;
    let words = 0;
    for (;;) {
      const token = tokens[last]!;
      // The pieces of a split long word count as one word and stay together.
      if (!token.continues) words += 1;
      const endsSentence = token.boundary === 'sentence' || token.boundary === 'paragraph';
      const complete = !token.continues && (words >= wordsPerFrame || endsSentence);
      if (complete || last === tokens.length - 1) break;
      last += 1;
    }
    frames.push({ text: join(tokens, first, last), first, last });
    first = last + 1;
  }
  return frames;
}

function join(tokens: readonly Token[], first: number, last: number): string {
  let text = '';
  for (let index = first; index <= last; index += 1) {
    const token = tokens[index]!;
    // A piece of a split word may carry a hyphen that is not in the source; drop it when rejoining.
    const hyphenAdded = token.continues && token.text.length > token.end - token.start;
    text += hyphenAdded ? token.text.slice(0, -1) : token.text;
    if (index < last && !token.continues) text += ' ';
  }
  return text;
}

/** Index of the frame that shows a given token. */
export function frameIndexOf(frames: readonly Frame[], tokenIndex: number): number {
  let low = 0;
  let high = frames.length - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (frames[middle]!.last < tokenIndex) low = middle + 1;
    else high = middle;
  }
  return Math.max(low, 0);
}

/** Where to put the focus letter: a single word has a recognition point, a group is centred. */
export function splitFrame(frame: Frame): PivotSplit {
  return frame.first === frame.last ? splitAtPivot(frame.text) : splitAtCentre(frame.text);
}
