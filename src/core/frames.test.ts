import { describe, expect, it } from 'vitest';
import { buildFrames, frameIndexOf, splitFrame } from './frames';
import { NO_PAUSES, buildTimeline, tokenDurationMs } from './timing';
import { tokenize } from './tokenize';

const texts = (text: string, size: number) => buildFrames(tokenize(text), size).map((f) => f.text);

describe('buildFrames', () => {
  it('shows one token per frame by default', () => {
    const tokens = tokenize('One two three.');
    expect(buildFrames(tokens)).toEqual([
      { text: 'One', first: 0, last: 0 },
      { text: 'two', first: 1, last: 1 },
      { text: 'three.', first: 2, last: 2 },
    ]);
  });

  it('groups words, covering every token exactly once', () => {
    const tokens = tokenize('The quick brown fox jumps over the lazy dog');
    const frames = buildFrames(tokens, 3);
    expect(frames.map((f) => f.text)).toEqual([
      'The quick brown',
      'fox jumps over',
      'the lazy dog',
    ]);
    expect(frames.flatMap((f) => [f.first, f.last])).toEqual([0, 2, 3, 5, 6, 8]);
    expect(texts('The quick brown fox jumps', 2)).toEqual(['The quick', 'brown fox', 'jumps']);
  });

  it('never runs a frame past the end of a sentence or paragraph', () => {
    expect(texts('Stop. Go on then, please. Yes', 3)).toEqual([
      'Stop.',
      'Go on then,',
      'please.',
      'Yes',
    ]);
    expect(texts('One two\n\nthree four five', 3)).toEqual(['One two', 'three four five']);
  });

  it('puts a split long word back together and counts it as one word', () => {
    expect(texts('an internationalization effort begins', 2)).toEqual([
      'an internationalization',
      'effort begins',
    ]);
    expect(texts('a state-of-the-art design', 2)).toEqual(['a state-of-the-art', 'design']);
  });

  it('copes with an empty text', () => {
    expect(buildFrames([], 3)).toEqual([]);
  });
});

describe('frameIndexOf', () => {
  it('finds the frame that shows a token', () => {
    const frames = buildFrames(tokenize('a b c d e f g'), 3);
    expect([0, 1, 2, 3, 4, 5, 6].map((token) => frameIndexOf(frames, token))).toEqual([
      0, 0, 0, 1, 1, 1, 2,
    ]);
    expect(frameIndexOf(frames, 99)).toBe(2);
    expect(frameIndexOf([], 0)).toBe(0);
  });
});

describe('splitFrame', () => {
  const show = (text: string, size: number) =>
    buildFrames(tokenize(text), size).map((frame) => {
      const { before, pivot, after } = splitFrame(frame);
      return `${before}[${pivot}]${after}`;
    });

  it('uses the recognition point for a single word', () => {
    expect(show('reading', 1)).toEqual(['re[a]ding']);
  });

  it('centres a group on the letter nearest its middle', () => {
    // The exact middle is the space, so the nearest letter is used.
    expect(show('quick brown', 2)).toEqual(['quic[k] brown']);
    expect(show('the lazy dog', 3)).toEqual(['the la[z]y dog']);
  });
});

describe('timeline over frames', () => {
  it('gives a frame the time its words would take one by one', () => {
    const tokens = tokenize('The quick brown fox jumps over. The lazy dog sleeps, mostly.');
    const single = buildTimeline(tokens);
    const frames = buildFrames(tokens, 3);
    const grouped = buildTimeline(tokens, undefined, frames);

    expect(grouped.weights.length).toBe(frames.length);
    expect(grouped.wordCount).toBe(single.wordCount);
    frames.forEach((frame, i) => {
      let expected = 0;
      for (let t = frame.first; t <= frame.last; t += 1)
        expected += tokenDurationMs(single, t, 300);
      expect(tokenDurationMs(grouped, i, 300)).toBeCloseTo(expected, 6);
    });
  });

  it('gives every word the same time when pauses are off', () => {
    const tokens = tokenize('Short words, then more. And a new one.');
    const even = buildTimeline(tokens, NO_PAUSES);
    expect(new Set(Array.from(even.weights))).toEqual(new Set([1]));
  });
});
