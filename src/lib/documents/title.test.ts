import { describe, expect, it } from 'vitest';
import { deriveTitle } from './title';

describe('deriveTitle', () => {
  it('uses the first non-empty line', () => {
    expect(deriveTitle('\n\n  The   Title \nBody text')).toBe('The Title');
  });

  it('shortens a long first line at a word boundary', () => {
    const title = deriveTitle(
      'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness',
    );
    expect(title).toBe('It was the best of times, it was the worst of times, it was…');
    expect(title.length).toBeLessThanOrEqual(61);
  });

  it('cuts mid-word when there is no sensible boundary', () => {
    expect(deriveTitle('x'.repeat(200))).toBe(`${'x'.repeat(60)}…`);
  });

  it('falls back for blank text', () => {
    expect(deriveTitle('  \n ')).toBe('Untitled');
  });
});
