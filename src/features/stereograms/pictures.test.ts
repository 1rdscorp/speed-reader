import { describe, expect, it } from 'vitest';
import { BUILT_IN } from './pictures';

describe('built-in stereograms', () => {
  it('are ten drawn pictures, then four of random dots, then forty-six textured ones', () => {
    expect(BUILT_IN).toHaveLength(60);
    expect(BUILT_IN.slice(0, 10).every((picture) => !picture.file)).toBe(true);
    expect(BUILT_IN.slice(10, 14).map((picture) => picture.file)).toEqual([
      'dots-1.png',
      'dots-2.png',
      'dots-3.png',
      'dots-4.png',
    ]);
    expect(BUILT_IN[14]).toEqual({ word: 'PEACE', file: 'textured-05.png', kind: 'Textured' });
    expect(BUILT_IN[59]).toEqual({ word: 'HAHA', file: 'textured-50.png', kind: 'Textured' });
  });

  it('each have a word, and no two share a picture file', () => {
    const files = BUILT_IN.flatMap((picture) => (picture.file ? [picture.file] : []));
    expect(new Set(files).size).toBe(files.length);
    for (const { word, file } of BUILT_IN) {
      expect(word).toMatch(/^[A-Z][A-Z !]*$/);
      // The file's name does not give the word away.
      expect(file?.toUpperCase().includes(word) ?? false).toBe(false);
    }
  });
});
