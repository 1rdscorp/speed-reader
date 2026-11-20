import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PAUSES,
  buildTimeline,
  clampWpm,
  remainingMs,
  tokenDurationMs,
  tokenWeight,
} from './timing';
import { tokenize } from './tokenize';

const TEXT =
  'Reading is a rhythm. Short words pass quickly, but extraordinarily long ones linger.\n\nA new paragraph begins here.';

describe('tokenWeight', () => {
  it('adds a pause after boundaries, longest after a paragraph', () => {
    const [plain, clause, sentence, paragraph] = tokenize('one two, three. Four');
    expect(tokenWeight(plain!)).toBe(1);
    expect(tokenWeight(clause!)).toBe(1 + DEFAULT_PAUSES.clause);
    expect(tokenWeight(sentence!)).toBe(1 + DEFAULT_PAUSES.sentence);
    expect(tokenWeight(paragraph!)).toBe(1 + DEFAULT_PAUSES.paragraph);
  });

  it('gives long words more time', () => {
    const [short, long, longer] = tokenize('cat catastrophe unpredictable extra');
    expect(tokenWeight(short!)).toBe(1);
    expect(tokenWeight(long!)).toBeGreaterThan(1);
    expect(tokenWeight(longer!)).toBeGreaterThan(tokenWeight(long!));
  });
});

describe('timeline', () => {
  const tokens = tokenize(TEXT);
  const timeline = buildTimeline(tokens);

  it('makes the chosen WPM the true average speed, pauses included', () => {
    for (const wpm of [200, 300, 650]) {
      const total = tokens.reduce((sum, _, i) => sum + tokenDurationMs(timeline, i, wpm), 0);
      expect(total).toBeCloseTo((timeline.wordCount / wpm) * 60_000, 6);
      expect(remainingMs(timeline, 0, wpm)).toBeCloseTo(total, 6);
    }
  });

  it('reports the time remaining from any position', () => {
    const fromFive = tokens
      .slice(5)
      .reduce((sum, _, i) => sum + tokenDurationMs(timeline, i + 5, 300), 0);
    expect(remainingMs(timeline, 5, 300)).toBeCloseTo(fromFive, 6);
    expect(remainingMs(timeline, tokens.length, 300)).toBe(0);
  });

  it('counts a split word once', () => {
    expect(buildTimeline(tokenize('a state-of-the-art design')).wordCount).toBe(3);
  });

  it('copes with an empty text', () => {
    const empty = buildTimeline([]);
    expect(remainingMs(empty, 0, 300)).toBe(0);
    expect(tokenDurationMs(empty, 0, 300)).toBe(0);
  });
});

describe('clampWpm', () => {
  it('keeps speed inside the supported range', () => {
    expect(clampWpm(50)).toBe(100);
    expect(clampWpm(5000)).toBe(1000);
    expect(clampWpm(312.4)).toBe(312);
    expect(clampWpm(Number.NaN)).toBe(300);
  });
});
