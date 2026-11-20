import { ImportError, type ImportFailure } from '@/lib/import';
import { StorageFullError } from '@/lib/storage';

type Describe = (name: string) => string;

const FILE_MESSAGES: Record<ImportFailure, Describe> = {
  unsupported: (name) =>
    `“${name}” is not a kind of file this can read. It reads text, Markdown, saved web pages, EPUB and PDF.`,
  'too-large': (name) => `“${name}” is too large to open here.`,
  unreadable: (name) => `“${name}” could not be read. The file may be damaged.`,
  empty: (name) => `There are no words to read in “${name}”.`,
  'no-text': (name) =>
    `“${name}” holds pictures of pages rather than text, so there is nothing to read yet. It needs text recognition (OCR) first.`,
  protected: (name) =>
    `“${name}” is copy-protected or password-locked, so its text cannot be read.`,
  'bad-address': (name) => `“${name}” could not be read.`,
  refused: (name) => `“${name}” could not be read.`,
  'fetch-failed': (name) => `“${name}” could not be read.`,
};

const LINK_MESSAGES: Record<ImportFailure, Describe> = {
  ...FILE_MESSAGES,
  unsupported: () =>
    'That link leads to something this cannot read. It reads web pages, text, EPUB and PDF.',
  'too-large': () => 'What that link leads to is too large to open here.',
  unreadable: () => 'What that link leads to could not be read.',
  empty: () => 'No article text was found on that page.',
  'bad-address': (name) =>
    `“${name}” is not a web address. It should look like example.com/article.`,
  refused: () =>
    'The site would not hand over that page. It may have moved, or need you to sign in.',
  'fetch-failed': () =>
    'That page could not be reached. Check the address and your connection, then try again.',
};

/** Turn whatever went wrong while adding a text into a sentence for the person who tried. */
export function describeFailure(kind: 'file' | 'link', name: string, error: unknown): string {
  if (error instanceof ImportError) {
    return (kind === 'link' ? LINK_MESSAGES : FILE_MESSAGES)[error.reason](name);
  }
  if (error instanceof StorageFullError) {
    return `There is not enough room in this browser to keep “${name}”. Remove something from your library and try again.`;
  }
  return `“${name}” could not be saved. Check that this site is allowed to store data, then try again.`;
}
