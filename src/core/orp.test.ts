import { describe, expect, it } from 'vitest';
import { splitAtPivot } from './orp';

const pivot = (word: string) => {
  const { before, pivot, after } = splitAtPivot(word);
  return `${before}[${pivot}]${after}`;
};

describe('splitAtPivot', () => {
  it('places the pivot about a third of the way into the word', () => {
    expect(pivot('a')).toBe('[a]');
    expect(pivot('to')).toBe('t[o]');
    expect(pivot('speed')).toBe('s[p]eed');
    expect(pivot('reading')).toBe('re[a]ding');
    expect(pivot('recognition')).toBe('rec[o]gnition');
    expect(pivot('internationally')).toBe('inte[r]nationally');
  });

  it('ignores surrounding punctuation when measuring', () => {
    expect(pivot('"Hello,"')).toBe('"H[e]llo,"');
    expect(pivot('(it)')).toBe('(i[t])');
  });

  it('handles words with no letters or digits', () => {
    expect(pivot('&')).toBe('[&]');
    expect(pivot('')).toBe('[]');
  });

  it('treats an accented or composed character as one letter', () => {
    expect(pivot('été')).toBe('é[t]é');
  });
});
