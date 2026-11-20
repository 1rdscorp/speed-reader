import type { FileFormat } from '@/lib/documents';
import type { FormatReader, ImportInput } from './types';

interface FormatDefinition {
  format: FileFormat;
  extensions: string[];
  mimeTypes: string[];
  /** Readers are loaded on first use, so their parsing libraries stay out of the main bundle. */
  read: FormatReader;
}

/** Every format the app can import. To support another, add a reader and list it here. */
const FORMATS: FormatDefinition[] = [
  {
    format: 'txt',
    extensions: ['.txt', '.text'],
    mimeTypes: ['text/plain'],
    read: async (input) => (await import('./readers/text')).readText(input),
  },
  {
    format: 'md',
    extensions: ['.md', '.markdown'],
    mimeTypes: ['text/markdown'],
    read: async (input) => (await import('./readers/markdown')).readMarkdown(input),
  },
  {
    format: 'html',
    extensions: ['.html', '.htm', '.xhtml'],
    mimeTypes: ['text/html', 'application/xhtml+xml'],
    read: async (input) => (await import('./readers/html')).readHtml(input),
  },
  {
    format: 'epub',
    extensions: ['.epub'],
    mimeTypes: ['application/epub+zip'],
    read: async (input) => (await import('./readers/epub')).readEpub(input),
  },
  {
    format: 'pdf',
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    read: async (input) => (await import('./readers/pdf')).readPdf(input),
  },
];

/** For a file input's `accept` attribute. */
export const ACCEPTED_FILES = FORMATS.flatMap((definition) => [
  ...definition.extensions,
  ...definition.mimeTypes,
]).join(',');

export function readerFor(format: FileFormat): FormatReader {
  return FORMATS.find((definition) => definition.format === format)!.read;
}

function startsWith(bytes: Uint8Array, signature: string, offset = 0): boolean {
  return Array.from(signature).every((char, i) => bytes[offset + i] === char.charCodeAt(0));
}

/**
 * Work out what a file is: by its first bytes where the format has a
 * signature (names can lie), then by extension, then by reported MIME type.
 */
export function detectFormat(input: ImportInput): FileFormat | undefined {
  if (startsWith(input.bytes, '%PDF-')) return 'pdf';
  if (startsWith(input.bytes, 'PK\u0003\u0004')) {
    // An EPUB is a zip whose first entry is named "mimetype" and holds the EPUB media type.
    // Other zips (.docx, .zip) are not something we can read.
    return startsWith(input.bytes, 'mimetypeapplication/epub+zip', 30) ? 'epub' : undefined;
  }
  const name = input.name.toLowerCase();
  const mimeType = input.contentType.split(';', 1)[0]!.trim().toLowerCase();
  return (
    FORMATS.find((definition) =>
      definition.extensions.some((extension) => name.endsWith(extension)),
    ) ?? FORMATS.find((definition) => definition.mimeTypes.includes(mimeType))
  )?.format;
}
