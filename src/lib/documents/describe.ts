import type { DocumentSource } from './types';

/** "Not started", "43% read" or "Finished". */
export function describeProgress(fraction: number): string {
  if (fraction >= 1) return 'Finished';
  const percent = Math.round(fraction * 100);
  return percent === 0 ? 'Not started' : `${percent}% read`;
}

const FORMAT_NAMES = {
  txt: 'Text file',
  md: 'Markdown',
  html: 'Web page',
  epub: 'EPUB',
  pdf: 'PDF',
};

/** A short label for where a text came from: "Pasted", "EPUB", "example.com". */
export function describeSource(source: DocumentSource): string {
  switch (source.kind) {
    case 'paste':
      return 'Pasted';
    case 'sample':
      return 'Sample';
    case 'file':
      return FORMAT_NAMES[source.format];
    case 'url':
      try {
        return new URL(source.url).hostname.replace(/^www\./, '');
      } catch {
        return 'Web page';
      }
  }
}
