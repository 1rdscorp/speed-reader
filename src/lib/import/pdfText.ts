/** A run of text from a PDF page, reduced to what paragraph reconstruction needs. */
export interface PdfTextItem {
  text: string;
  /** Position of the start of the run, in page units. PDF y grows upwards. */
  x: number;
  y: number;
  /** Roughly the font size. */
  height: number;
  /** True when the next run starts on a new line. */
  endsLine: boolean;
}

interface Line {
  text: string;
  x: number;
  y: number;
  height: number;
}

/**
 * Rebuild flowing text from positioned runs. A PDF stores where each line is
 * drawn, not what a paragraph is, so this infers it: lines are joined (undoing
 * hyphenation at line ends), paragraphs are split at larger gaps and indents,
 * and page numbers and running headers are dropped.
 */
export function assemblePdfText(pages: PdfTextItem[][]): string {
  const pageLines = pages.map(toLines);
  removeRunningLines(pageLines);

  // The usual distance between lines, taken over the whole document: a page
  // with only a few lines on it has no "usual" of its own.
  const leading = median(
    pageLines.flatMap((lines) =>
      lines.slice(1).flatMap((line, i) => {
        const gap = lines[i]!.y - line.y;
        return gap > 0 ? [gap] : [];
      }),
    ),
  );

  const paragraphs: string[] = [];
  for (const lines of pageLines) {
    const [first, ...rest] = toParagraphs(lines, leading);
    const previous = paragraphs.at(-1);
    // A paragraph can run over a page break: no full stop before it, lower-case after it.
    if (first !== undefined && previous !== undefined && continues(previous, first)) {
      paragraphs[paragraphs.length - 1] = join(previous, first);
    } else if (first !== undefined) {
      paragraphs.push(first);
    }
    paragraphs.push(...rest);
  }
  return paragraphs.join('\n\n');
}

function toLines(items: PdfTextItem[]): Line[] {
  const lines: Line[] = [];
  let current: Line | undefined;
  const end = () => {
    if (current && current.text.trim()) lines.push({ ...current, text: current.text.trim() });
    current = undefined;
  };
  for (const item of items) {
    if (item.text) {
      current ??= { text: '', x: item.x, y: item.y, height: item.height };
      current.text += item.text;
      current.height = Math.max(current.height, item.height);
    }
    if (item.endsLine) end();
  }
  end();
  return lines;
}

const PAGE_NUMBER = /^(?:page\s+)?[-–—\s]*\d+(?:\s*(?:\/|of)\s*\d+)?[-–—\s]*$/i;
/** Running headers repeat with only the page number changing. */
const runningKey = (line: Line) => line.text.replace(/\d+/g, '#').toLowerCase();

/** The line nearest the top or bottom edge of a page, wherever it comes in the page's text order. */
function outermost(lines: Line[], edge: 'top' | 'bottom'): Line | undefined {
  return lines.reduce<Line | undefined>((best, line) => {
    if (!best) return line;
    return (edge === 'top' ? line.y > best.y : line.y < best.y) ? line : best;
  }, undefined);
}

/** A line at the very top or bottom that recurs on this many pages is furniture, not text. */
const RUNNING_LINE_PAGES = 3;

/**
 * Drop page numbers and running headers and footers. They are found by
 * position, not order: many PDFs draw them after the body of the page.
 */
function removeRunningLines(pages: Line[][]): void {
  for (const edge of ['top', 'bottom'] as const) {
    // Twice, because an edge can carry both a running title and a page number.
    for (let pass = 0; pass < 2; pass += 1) {
      const edgeLines = pages.map((lines) => outermost(lines, edge));
      const counts = new Map<string, number>();
      for (const line of edgeLines) {
        if (line) counts.set(runningKey(line), (counts.get(runningKey(line)) ?? 0) + 1);
      }
      pages.forEach((lines, i) => {
        const line = edgeLines[i];
        if (!line || lines.length < 2) return;
        const repeats = (counts.get(runningKey(line)) ?? 0) >= RUNNING_LINE_PAGES;
        if (repeats || PAGE_NUMBER.test(line.text)) lines.splice(lines.indexOf(line), 1);
      });
    }
  }
}

function median(values: number[]): number {
  const sorted = values.toSorted((a, b) => a - b);
  return sorted[(sorted.length - 1) >> 1] ?? 0;
}

function toParagraphs(lines: Line[], leading: number): string[] {
  // The usual left edge on this page (it differs between left and right pages).
  const margin = median(lines.map((line) => line.x));

  const paragraphs: string[] = [];
  lines.forEach((line, i) => {
    const previous = lines[i - 1];
    const gap = previous ? previous.y - line.y : 0;
    const startsParagraph =
      !previous ||
      // noticeably more space than between ordinary lines
      (leading > 0 && gap > leading * 1.45) ||
      // a first-line indent (a new column gives a negative gap and is not a break in itself)
      (gap > 0 && line.x - margin > line.height * 0.8 && previous.x - margin <= line.height * 0.8);
    if (startsParagraph) paragraphs.push(line.text);
    else paragraphs[paragraphs.length - 1] = join(paragraphs.at(-1)!, line.text);
  });
  return paragraphs;
}

/** Join two pieces of the same paragraph, mending a word hyphenated across the break. */
function join(before: string, after: string): string {
  if (/\p{L}-$/u.test(before) && /^\p{Ll}/u.test(after)) return before.slice(0, -1) + after;
  return `${before} ${after}`;
}

function continues(before: string, after: string): boolean {
  return !/[.!?:;"”’)\]]$/.test(before) && /^\p{Ll}/u.test(after);
}
