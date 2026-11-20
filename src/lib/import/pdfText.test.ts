import { describe, expect, it } from 'vitest';
import { assemblePdfText, type PdfTextItem } from './pdfText';

/** Lay out lines of text top-down, the way a PDF page reports them. */
function page(lines: Array<string | { text: string; x?: number; gap?: number }>): PdfTextItem[] {
  let y = 700;
  return lines.map((line) => {
    const { text, x = 72, gap = 14 } = typeof line === 'string' ? { text: line } : line;
    y -= gap;
    return { text, x, y, height: 11, endsLine: true };
  });
}

describe('assemblePdfText', () => {
  it('joins the lines of a paragraph', () => {
    expect(assemblePdfText([page(['The quick brown fox', 'jumps over the lazy dog.'])])).toBe(
      'The quick brown fox jumps over the lazy dog.',
    );
  });

  it('joins runs on the same line', () => {
    const items: PdfTextItem[] = [
      { text: 'Hello, ', x: 72, y: 700, height: 11, endsLine: false },
      { text: 'world.', x: 110, y: 700, height: 11, endsLine: true },
    ];
    expect(assemblePdfText([items])).toBe('Hello, world.');
  });

  it('mends words hyphenated across lines, but keeps real hyphens', () => {
    expect(
      assemblePdfText([page(['An extra-', 'ordinary claim about a well-', 'Known person.'])]),
    ).toBe('An extraordinary claim about a well- Known person.');
  });

  it('starts a paragraph at a larger gap', () => {
    expect(
      assemblePdfText([
        page([
          'First paragraph, line one',
          'and line two.',
          { text: 'Second paragraph.', gap: 28 },
          'Its end.',
        ]),
      ]),
    ).toBe('First paragraph, line one and line two.\n\nSecond paragraph. Its end.');
  });

  it('starts a paragraph at a first-line indent', () => {
    expect(
      assemblePdfText([
        page([
          'First paragraph ends here.',
          { text: 'Indented start of the next', x: 90 },
          'paragraph in the book.',
          'More of it.',
        ]),
      ]),
    ).toBe(
      'First paragraph ends here.\n\nIndented start of the next paragraph in the book. More of it.',
    );
  });

  it('removes page numbers and running headers', () => {
    const pages = [1, 2, 3, 4].map((n) =>
      page([
        `A Tale of Two Cities ${n}`,
        {
          text: `Body of page ${n === 1 ? 'one' : n === 2 ? 'two' : n === 3 ? 'three' : 'four'}.`,
          gap: 30,
        },
        { text: `${n}`, gap: 40 },
      ]),
    );
    expect(assemblePdfText(pages)).toBe(
      'Body of page one.\n\nBody of page two.\n\nBody of page three.\n\nBody of page four.',
    );
  });

  it('finds headers and footers by position, even when they are drawn after the body', () => {
    const pages = ['one', 'two', 'three'].map((word, n) => [
      { text: `Body of page ${word}.`, x: 72, y: 600, height: 11, endsLine: true },
      { text: `It ends with ${word}.`, x: 72, y: 586, height: 11, endsLine: true },
      { text: 'Annual Report', x: 200, y: 760, height: 8, endsLine: true },
      { text: `Page ${n + 1} of 3`, x: 200, y: 30, height: 8, endsLine: true },
    ]);
    expect(assemblePdfText(pages)).toBe(
      'Body of page one. It ends with one.\n\nBody of page two. It ends with two.\n\nBody of page three. It ends with three.',
    );
  });

  it('removes both a running title and a page number from the same edge', () => {
    const pages = [1, 2, 3].map((n) =>
      page([`${n}`, 'Chapter Seven', { text: `Text of page ${n} goes here.`, gap: 30 }]),
    );
    expect(assemblePdfText(pages)).toBe(
      'Text of page 1 goes here.\n\nText of page 2 goes here.\n\nText of page 3 goes here.',
    );
  });

  it('carries a paragraph across a page break', () => {
    expect(
      assemblePdfText([
        page(['It was the best of times, it was the', 'worst of times, it was the age of wis-']),
        page(['dom, it was the age of foolishness.', { text: 'A new paragraph.', gap: 28 }]),
      ]),
    ).toBe(
      'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.\n\nA new paragraph.',
    );
  });

  it('copes with empty pages', () => {
    expect(assemblePdfText([[], page(['Only this.']), []])).toBe('Only this.');
    expect(assemblePdfText([])).toBe('');
  });
});
