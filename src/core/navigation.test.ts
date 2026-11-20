import { describe, expect, it } from 'vitest';
import { indexAtOffset, nextSentence, previousSentence, sentenceStart } from './navigation';
import { tokenize } from './tokenize';

//                       0   1    2    3     4   5   6     7    8      9    10
const TEXT = 'One two three four. Five six seven eight nine.\n\nTen eleven.';
const tokens = tokenize(TEXT);

describe('sentence navigation', () => {
  it('finds the start of the current sentence', () => {
    expect(sentenceStart(tokens, 0)).toBe(0);
    expect(sentenceStart(tokens, 3)).toBe(0);
    expect(sentenceStart(tokens, 4)).toBe(4);
    expect(sentenceStart(tokens, 8)).toBe(4);
    expect(sentenceStart(tokens, 10)).toBe(9);
  });

  it('replays the current sentence when a few words in', () => {
    expect(previousSentence(tokens, 8)).toBe(4);
    expect(previousSentence(tokens, 3)).toBe(0);
  });

  it('goes to the sentence before when at the start of one', () => {
    expect(previousSentence(tokens, 4)).toBe(0);
    expect(previousSentence(tokens, 5)).toBe(0);
    expect(previousSentence(tokens, 9)).toBe(4);
    expect(previousSentence(tokens, 0)).toBe(0);
  });

  it('skips forward to the next sentence, stopping at the last word', () => {
    expect(nextSentence(tokens, 0)).toBe(4);
    expect(nextSentence(tokens, 4)).toBe(9);
    expect(nextSentence(tokens, 9)).toBe(10);
    expect(nextSentence(tokens, 10)).toBe(10);
  });
});

describe('indexAtOffset', () => {
  it('maps a character offset back to a token', () => {
    for (const [i, token] of tokens.entries()) {
      expect(indexAtOffset(tokens, token.start)).toBe(i);
    }
  });

  it('lands on the next token when the offset falls between words', () => {
    expect(indexAtOffset(tokens, tokens[3]!.end)).toBe(4);
  });

  it('clamps out-of-range offsets', () => {
    expect(indexAtOffset(tokens, -5)).toBe(0);
    expect(indexAtOffset(tokens, 10_000)).toBe(tokens.length - 1);
    expect(indexAtOffset([], 3)).toBe(0);
  });
});
