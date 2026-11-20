import { describe, expect, it } from 'vitest';
import { formatClock, formatReadingTime } from './format';

describe('formatClock', () => {
  it('formats minutes and seconds, adding hours only when needed', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(42_400)).toBe('0:42');
    expect(formatClock(242_000)).toBe('4:02');
    expect(formatClock(3_842_000)).toBe('1:04:02');
    expect(formatClock(-5)).toBe('0:00');
  });
});

describe('formatReadingTime', () => {
  it('describes reading time roughly', () => {
    expect(formatReadingTime(100, 300)).toBe('under a minute');
    expect(formatReadingTime(1200, 300)).toBe('about 4 min');
    expect(formatReadingTime(18_000, 300)).toBe('about 1 h');
    expect(formatReadingTime(24_000, 300)).toBe('about 1 h 20 min');
  });
});
