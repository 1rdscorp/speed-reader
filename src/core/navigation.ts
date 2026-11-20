import type { Token } from './tokenize';

function startsSentence(tokens: readonly Token[], index: number): boolean {
  if (index <= 0) return true;
  const boundary = tokens[index - 1]?.boundary;
  return boundary === 'sentence' || boundary === 'paragraph';
}

/** Index of the first token of the sentence that contains `index`. */
export function sentenceStart(tokens: readonly Token[], index: number): number {
  let i = Math.min(index, tokens.length - 1);
  while (i > 0 && !startsSentence(tokens, i)) i -= 1;
  return Math.max(i, 0);
}

/** A few words into a sentence, "back" means "again"; right at its start it means the one before. */
const REPLAY_THRESHOLD = 2;

/** Where the "back a sentence" control should land. */
export function previousSentence(tokens: readonly Token[], index: number): number {
  const start = sentenceStart(tokens, index);
  if (start === 0 || index - start > REPLAY_THRESHOLD) return start;
  return sentenceStart(tokens, start - 1);
}

/** Where the "forward a sentence" control should land; the last token if there is no next sentence. */
export function nextSentence(tokens: readonly Token[], index: number): number {
  for (let i = index + 1; i < tokens.length; i += 1) {
    if (startsSentence(tokens, i)) return i;
  }
  return Math.max(tokens.length - 1, 0);
}

/**
 * Index of the token at (or first after) a character offset in the source text.
 * Reading positions are stored as offsets so they survive changes to tokenisation.
 */
export function indexAtOffset(tokens: readonly Token[], offset: number): number {
  let low = 0;
  let high = tokens.length - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (tokens[middle]!.end <= offset) low = middle + 1;
    else high = middle;
  }
  return Math.max(low, 0);
}
