const MAX_TITLE_LENGTH = 60;

/** A title for untitled text: its first line, shortened at a word boundary. */
export function deriveTitle(text: string): string {
  const firstLine = text.trim().split('\n', 1)[0]?.replace(/\s+/g, ' ').trim() ?? '';
  if (firstLine === '') return 'Untitled';
  if (firstLine.length <= MAX_TITLE_LENGTH) return firstLine;
  const cut = firstLine.slice(0, MAX_TITLE_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > MAX_TITLE_LENGTH / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?—–-]+$/, '')}…`;
}
