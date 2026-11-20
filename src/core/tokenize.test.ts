import { describe, expect, it } from 'vitest';
import { MAX_TOKEN_LENGTH, countWords, tokenize } from './tokenize';

const words = (text: string) => tokenize(text).map((token) => token.text);
const boundaries = (text: string) => tokenize(text).map((token) => token.boundary);

describe('tokenize', () => {
  it('splits on whitespace and records source offsets', () => {
    const text = '  Read   faster\ttoday ';
    const tokens = tokenize(text);
    expect(tokens.map((t) => t.text)).toEqual(['Read', 'faster', 'today']);
    for (const token of tokens) {
      expect(text.slice(token.start, token.end)).toBe(token.text);
    }
  });

  it('returns nothing for empty or blank text', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize(' \n\n \t')).toEqual([]);
  });

  it('marks clause and sentence boundaries from punctuation', () => {
    expect(boundaries('Well, yes. Really? No! Fine')).toEqual([
      'clause',
      'sentence',
      'sentence',
      'sentence',
      'paragraph',
    ]);
  });

  it('sees through closing quotes and brackets', () => {
    expect(boundaries('He said "stop." (Really?) Then left')).toEqual([
      'none',
      'none',
      'sentence',
      'sentence',
      'none',
      'paragraph',
    ]);
  });

  it('starts a new paragraph at a blank line but not at a single line break', () => {
    const tokens = tokenize('one two\nthree\n\nfour five\n  \nsix');
    expect(tokens.map((t) => t.paragraph)).toEqual([0, 0, 0, 1, 1, 2]);
    expect(tokens.map((t) => t.boundary)).toEqual([
      'none',
      'none',
      'paragraph',
      'none',
      'paragraph',
      'paragraph',
    ]);
  });

  it('does not end a sentence at titles, initials or dotted acronyms', () => {
    expect(boundaries('Dr. Jones met J. Smith in the U.S. Army')).toEqual([
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'paragraph',
    ]);
  });

  it('does not end a sentence when the next word is lower-case', () => {
    expect(boundaries('about 5 min. of reading')).toEqual([
      'none',
      'none',
      'none',
      'none',
      'paragraph',
    ]);
  });

  it('still ends a sentence at "I."', () => {
    expect(boundaries('So did I. Then we left')[2]).toBe('sentence');
  });

  it('turns free-standing dashes and ellipses into a pause on the previous word', () => {
    const tokens = tokenize('dense material — contracts ... and so on');
    expect(tokens.map((t) => t.text)).toEqual([
      'dense',
      'material',
      'contracts',
      'and',
      'so',
      'on',
    ]);
    expect(tokens[1]?.boundary).toBe('clause');
    expect(tokens[2]?.boundary).toBe('clause');
  });

  it('splits words joined by an em dash', () => {
    const tokens = tokenize('this—that');
    expect(tokens.map((t) => t.text)).toEqual(['this—', 'that']);
    expect(tokens[0]?.boundary).toBe('clause');
  });

  it('drops list bullets', () => {
    expect(words('• first\n• second')).toEqual(['first', 'second']);
  });

  it('breaks hyphenated compounds at their hyphens', () => {
    const tokens = tokenize('a state-of-the-art design.');
    expect(tokens.map((t) => t.text)).toEqual(['a', 'state-of-the-', 'art', 'design.']);
    expect(tokens.map((t) => t.continues)).toEqual([false, true, false, false]);
  });

  it('cuts very long words into hyphenated pieces that fit the stage', () => {
    const text = 'pneumonoultramicroscopicsilicovolcanoconiosis.';
    const tokens = tokenize(text);
    expect(tokens.length).toBeGreaterThan(1);
    for (const token of tokens) {
      expect(token.text.length).toBeLessThanOrEqual(MAX_TOKEN_LENGTH);
    }
    // Every piece but the last is marked as continuing, and only the last carries the boundary.
    expect(tokens.slice(0, -1).every((t) => t.continues && t.text.endsWith('-'))).toBe(true);
    expect(tokens.at(-1)?.continues).toBe(false);
    // The pieces cover the source exactly.
    expect(tokens.map((t) => text.slice(t.start, t.end)).join('')).toBe(text);
  });

  it('never cuts through a multi-code-unit character', () => {
    const text = '👩‍👩‍👧‍👦'.repeat(20);
    for (const token of tokenize(text)) {
      expect(text.slice(token.start, token.end)).toMatch(/^(?:👩‍👩‍👧‍👦)+$/u);
    }
  });
});

describe('countWords', () => {
  it('counts a split long word once and ignores dashes', () => {
    expect(countWords('a state-of-the-art design — truly')).toBe(4);
    expect(countWords('')).toBe(0);
  });
});
