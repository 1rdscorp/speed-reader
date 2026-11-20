import { describe, expect, it } from 'vitest';
import { normalizeText } from './normalize';

describe('normalizeText', () => {
  it('unifies line endings and collapses runs of blank lines', () => {
    expect(normalizeText('one\r\ntwo\rthree\n\n\n\nfour')).toBe('one\ntwo\nthree\n\nfour');
  });

  it('removes invisible characters that would pad or split words', () => {
    expect(normalizeText('﻿hy­phen​ated wo⁠rd')).toBe('hyphenated word');
  });

  it('keeps joiners inside emoji', () => {
    expect(normalizeText('family 👩‍👩‍👧 here')).toBe('family 👩‍👩‍👧 here');
  });

  it('trims the ends and trailing spaces on lines', () => {
    expect(normalizeText('  \n first  \n\n second \n ')).toBe('first\n\n second');
  });
});
