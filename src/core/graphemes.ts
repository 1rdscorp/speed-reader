const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * Split a string into user-perceived characters, so accents, emoji and other
 * multi-code-unit characters are never cut in half.
 */
export function graphemes(text: string): string[] {
  return Array.from(segmenter.segment(text), (part) => part.segment);
}
